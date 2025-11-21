import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateExpiryDate,
  getProductByPriceId,
} from "@/lib/stripe/products";

// Extended Stripe subscription type with missing fields
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
  current_period_end?: number;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      // Payment succeeded - Upgrade user to Pro
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // Subscription created
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      // Subscription updated (e.g., plan change)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // Subscription deleted/cancelled - Downgrade to Free
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // Invoice payment succeeded - Renew subscription
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      // Invoice payment failed - Handle failed payment
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================
// Event Handlers
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;

  if (!userId) {
    console.error("[Webhook] No user ID in checkout session");
    return;
  }

  console.log(`[Webhook] Checkout completed for user: ${userId}`);

  // Get subscription details
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error("[Webhook] No subscription ID in session");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("[Webhook] No price ID found");
    return;
  }

  const product = getProductByPriceId(priceId);
  const expiryDate = calculateExpiryDate(product?.interval || "month");

  // Update user subscription in database (using admin client to bypass RLS)
  const supabase = createAdminClient();

  // Update user_subscriptions (main table)
  const { error: subError } = await supabase
    .from("user_subscriptions")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription_tier: "pro",
      subscription_expires_at: expiryDate.toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      ai_quota_limit: 100, // Pro quota
      cancel_at_period_end: false, // New subscription, not cancelling
    })
    .eq("user_id", userId);

  // Update user_profiles (legacy field for backward compatibility)
  const { error: profileError } = await supabase
    .from("user_profiles")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription: "pro",
      ai_quota_limit: 100, // Sync quota
    })
    .eq("user_id", userId);

  if (subError || profileError) {
    console.error(
      "[Webhook] Failed to update subscription:",
      subError || profileError
    );
  } else {
    console.log(
      `[Webhook] User ${userId} upgraded to Pro (both tables synced)`
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Webhook] No user ID in subscription");
    return;
  }

  console.log(`[Webhook] Subscription created for user: ${userId}`);
  // Already handled in checkout.session.completed
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Webhook] No user ID in subscription");
    return;
  }

  console.log(`[Webhook] Subscription updated for user: ${userId}`);
  console.log(
    `[Webhook] cancel_at_period_end: ${subscription.cancel_at_period_end}`
  );
  console.log(
    `[Webhook] current_period_end: ${
      (subscription as StripeSubscriptionWithPeriod).current_period_end
    }`
  );
  console.log(`[Webhook] status: ${subscription.status}`);

  // Check if subscription is being cancelled at period end
  if (subscription.cancel_at_period_end) {
    console.log(
      `[Webhook] Subscription will be cancelled at period end for user: ${userId}`
    );

    const supabase = createAdminClient();

    // Get current_period_end from subscription event (if available)
    const periodEnd = (subscription as StripeSubscriptionWithPeriod)
      .current_period_end;

    // Build update object - always set cancel flag
    const updateData: {
      cancel_at_period_end: boolean;
      subscription_expires_at?: string;
    } = {
      cancel_at_period_end: true, // Flag for UI warning
    };

    // Only update expiry date if we have current_period_end from event
    if (periodEnd && typeof periodEnd === "number") {
      const expiryDate = new Date(periodEnd * 1000);
      updateData.subscription_expires_at = expiryDate.toISOString();
      console.log(
        `[Webhook] Will update expiry to: ${expiryDate.toISOString()}`
      );
    } else {
      console.log(
        `[Webhook] No current_period_end in event, keeping existing expiry date`
      );
    }

    // Mark as cancelling - subscription still active until period end
    const { data, error } = await supabase
      .from("user_subscriptions")
      // @ts-expect-error: Supabase types not fully generated yet
      .update(updateData)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("[Webhook] Failed to set cancel_at_period_end:", error);
    } else {
      console.log(
        `[Webhook] ✅ Set cancel_at_period_end=true for user ${userId}`
      );
      console.log(`[Webhook] Updated rows:`, data);
    }
    return;
  }

  // Check if subscription was just cancelled (status = cancelled)
  if (subscription.status === "canceled") {
    console.log(`[Webhook] Subscription cancelled for user: ${userId}`);

    const supabase = createAdminClient();

    // Update user_subscriptions
    const { error: subError } = await supabase
      .from("user_subscriptions")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription_tier: "free",
        subscription_expires_at: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
        ai_quota_limit: 5,
      })
      .eq("user_id", userId);

    // Update user_profiles (sync legacy field)
    const { error: profileError } = await supabase
      .from("user_profiles")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription: "free",
        ai_quota_limit: 5,
      })
      .eq("user_id", userId);

    if (subError || profileError) {
      console.error(
        "[Webhook] Failed to downgrade user:",
        subError || profileError
      );
    } else {
      console.log(
        `[Webhook] User ${userId} downgraded to Free (both tables synced)`
      );
    }
    return;
  }

  // Handle regular subscription updates (e.g., plan change, renewal)
  // Skip if subscription was just created (handled in checkout.session.completed)
  const periodEnd = (subscription as StripeSubscriptionWithPeriod)
    .current_period_end;

  if (!periodEnd || typeof periodEnd !== "number") {
    console.log(
      "[Webhook] No current_period_end - subscription may be new, skipping update"
    );
    return;
  }

  const expiryDate = new Date(periodEnd * 1000);

  if (isNaN(expiryDate.getTime())) {
    console.error("[Webhook] Invalid date from timestamp:", periodEnd);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("user_subscriptions")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription_expires_at: expiryDate.toISOString(),
      stripe_price_id: priceId,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[Webhook] Failed to update subscription:", error);
  } else {
    console.log(`[Webhook] ✅ Subscription period updated for user: ${userId}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Webhook] No user ID in subscription");
    return;
  }

  console.log(`[Webhook] Subscription deleted for user: ${userId}`);

  // Downgrade to free (using admin client to bypass RLS)
  const supabase = createAdminClient();

  // Update user_subscriptions (main table)
  const { error: subError } = await supabase
    .from("user_subscriptions")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription_tier: "free",
      subscription_expires_at: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      ai_quota_limit: 5, // Free quota
      cancel_at_period_end: false, // Clear cancel flag
    })
    .eq("user_id", userId);

  // Update user_profiles (legacy field for backward compatibility)
  const { error: profileError } = await supabase
    .from("user_profiles")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription: "free",
      ai_quota_limit: 5, // Sync quota
    })
    .eq("user_id", userId);

  if (subError || profileError) {
    console.error(
      "[Webhook] Failed to downgrade user:",
      subError || profileError
    );
  } else {
    console.log(
      `[Webhook] User ${userId} downgraded to Free (both tables synced)`
    );
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // @ts-expect-error: Stripe type issue with subscription
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  console.log(`[Webhook] Invoice paid for subscription: ${subscriptionId}`);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  // Extend subscription
  const periodEnd = (subscription as StripeSubscriptionWithPeriod)
    .current_period_end;
  if (!periodEnd) return;
  const expiryDate = new Date(periodEnd * 1000);

  const supabase = createAdminClient();
  await supabase
    .from("user_subscriptions")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription_expires_at: expiryDate.toISOString(),
    })
    .eq("user_id", userId);

  console.log(`[Webhook] Subscription renewed for user: ${userId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // @ts-expect-error: Stripe type issue with subscription
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  console.log(`[Webhook] Payment failed for subscription: ${subscriptionId}`);

  // You can add logic here to:
  // - Send email notification
  // - Mark subscription as past_due
  // - Give grace period before downgrading
}

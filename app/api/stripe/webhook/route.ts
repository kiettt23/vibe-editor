import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import {
  calculateExpiryDate,
  getProductByPriceId,
} from "@/lib/stripe/products";

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

  // Update user subscription in database
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_subscriptions")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription_tier: "pro",
      subscription_expires_at: expiryDate.toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[Webhook] Failed to update subscription:", error);
  } else {
    console.log(`[Webhook] User ${userId} upgraded to Pro`);
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

  const priceId = subscription.items.data[0]?.price.id;
  // @ts-expect-error: Stripe type issue with current_period_end
  const expiryDate = new Date(subscription.current_period_end * 1000);

  const supabase = await createClient();
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
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Webhook] No user ID in subscription");
    return;
  }

  console.log(`[Webhook] Subscription deleted for user: ${userId}`);

  // Downgrade to free
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_subscriptions")
    // @ts-expect-error: Supabase types not fully generated yet
    .update({
      subscription_tier: "free",
      subscription_expires_at: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[Webhook] Failed to downgrade user:", error);
  } else {
    console.log(`[Webhook] User ${userId} downgraded to Free`);
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
  // @ts-expect-error: Stripe type issue with current_period_end
  const expiryDate = new Date(subscription.current_period_end * 1000);

  const supabase = await createClient();
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

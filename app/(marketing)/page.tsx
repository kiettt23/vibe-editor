import HeroSection from "@/components/marketing/hero-section";
import StatsSection from "@/components/marketing/stats-section";
import FeaturesSection from "@/components/marketing/features-section";
import HowItWorksSection from "@/components/marketing/how-it-works-section";
import TestimonialsSection from "@/components/marketing/testimonials-section";
import PricingSection from "@/components/marketing/pricing";
import CTASection from "@/components/marketing/cta-section";
import Footer from "@/components/shared/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

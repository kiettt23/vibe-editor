import HeroSection from "@/components/marketing/hero-section";
import FeaturesSection from "@/components/marketing/features-section";
import PricingSection from "@/components/marketing/pricing";
import CTASection from "@/components/marketing/cta-section";
import Footer from "@/components/shared/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

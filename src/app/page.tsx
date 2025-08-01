import EnhancedCursor from "../components/homepageComponents/enhanced-cursor";
import MouseTrail from "../components/homepageComponents/mouse-trail"
import Navigation from "../components/homepageComponents/navigation"
import HeroSection from "../components/homepageComponents/hero-section"
import FeaturesSection from "../components/homepageComponents/features-section"
import HowItWorks from "../components/homepageComponents/how-it-works"
import CTASection from "../components/homepageComponents/cta-section"

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-slate-900 overflow-x-hidden">
      <EnhancedCursor />
      <MouseTrail />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
    </main>
  )
}

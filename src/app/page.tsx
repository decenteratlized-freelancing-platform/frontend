"use client";
import NewHomepage from "@/components/homepageComponents/new-homepage";
import BenefitsSection from "@/components/homepageComponents/benefits-section";
import RadialTimelineSection from "@/components/homepageComponents/radial-timeline-section";
import HowItWorksSection from "@/components/homepageComponents/HowItWorksSection";
import TestimonialsSection from "@/components/homepageComponents/TestimonialsSection";
import CtaSection from "@/components/homepageComponents/CtaSection";
import Footer from "@/components/homepageComponents/Footer";
import Navigation from "@/components/homepageComponents/navigation";
import { Scene } from "@/components/ui/hero-section";

export default function HomePage() {
  return (
    <div>
      <Navigation />
      <div className='absolute inset-0 opacity-50'>
        <Scene />
      </div>
      <main>
        <NewHomepage />
        <BenefitsSection />
        <HowItWorksSection />
        <RadialTimelineSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

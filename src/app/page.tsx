"use client";
import dynamic from 'next/dynamic';
import NewHomepage from "@/components/homepageComponents/new-homepage";
import BenefitsSection from "@/components/homepageComponents/benefits-section";
import RadialTimelineSection from "@/components/homepageComponents/radial-timeline-section";
import HowItWorksSection from "@/components/homepageComponents/HowItWorksSection";
import TestimonialsSection from "@/components/homepageComponents/TestimonialsSection";
import Footer from "@/components/homepageComponents/Footer";
import Navigation from "@/components/homepageComponents/navigation";

const Scene = dynamic(() => import("@/components/ui/hero-section").then(mod => mod.Scene), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
});

const CtaSection = dynamic(() => import("@/components/homepageComponents/CtaSection"), {
  ssr: false
});

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

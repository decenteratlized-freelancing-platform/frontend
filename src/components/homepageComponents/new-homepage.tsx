"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ShieldCheck, FileText, Bot } from "lucide-react";

const platformFeatures = [
  {
    icon: Globe,
    title: "Global Talent",
    description: "Access a diverse pool of vetted professionals.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Escrow",
    description: "Guaranteed payments with our trusted escrow system.",
  },
  {
    icon: FileText,
    title: "Smart Contracts",
    description: "Automated, transparent, and enforceable agreements.",
  },
  {
    icon: Bot,
    title: "AI-Powered Matching",
    description: "Find the perfect expert for your project instantly.",
  },
];

const DemoOne = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="w-full max-w-6xl space-y-16 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 px-4 py-2 rounded-full">
            ✨ Where freelancing is safe by design.
          </Badge>
          
          <div className="space-y-6 flex items-center justify-center flex-col">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-4xl">
              Your Vision, Our Talent. Projects Delivered.
            </h1>
            <p className="text-lg text-neutral-300 max-w-3xl">
              SmartHire is the decentralized platform connecting ambitious clients with elite freelancers. Experience transparent contracts, secure escrow payments, and seamless collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link href="/client/discover" passHref>
                <Button className="text-base px-8 py-4 rounded-xl bg-white text-black border border-white/10 shadow-lg hover:bg-white/90 transition-transform hover:scale-105 text-sm">
                  Find Talent
                </Button>
              </Link>
              <Link href="/freelancer/browse-jobs" passHref>
                <Button variant="outline" className="text-base px-8 py-4 rounded-xl bg-transparent text-white border-white/20 shadow-lg hover:bg-white/10 hover:scale-105 transition-transform text-sm">
                  Find Work
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {platformFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 h-48 flex flex-col justify-start items-start space-y-3 hover:-translate-y-2 transition-transform"
            >
              <feature.icon size={20} className="text-white/80" />
              <h3 className="text-base font-medium">{feature.title}</h3>
              <p className="text-sm text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoOne;


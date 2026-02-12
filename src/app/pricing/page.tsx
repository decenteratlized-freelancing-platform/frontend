"use client";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Star, Info } from "lucide-react";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Talent",
    price: "0%",
    description: "For freelancers looking to build their reputation and earn.",
    features: [
      "AI-Verified Skills",
      "Unlimited Proposals",
      "Blockchain-Secured Escrow",
      "Instant Crypto Payments",
      "Reputation Score (Soulbound)",
    ],
    cta: "Start Earning",
    popular: false,
  },
  {
    name: "Startup",
    price: "2.5%",
    description: "For small teams and individuals looking to hire top talent.",
    features: [
      "AI-Generated Smart Contracts",
      "Escrow Protection",
      "Dispute Resolution Support",
      "Fiat & Crypto Gateway",
      "Up to 5 Active Contracts",
    ],
    cta: "Post a Job",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex hiring needs.",
    features: [
      "Dedicated Dispute Manager",
      "Custom Smart Contract Logic",
      "Priority AI Support",
      "Advanced Analytics Dashboard",
      "Unlimited Active Contracts",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Transparent Pricing for the <span className="text-blue-500">Future of Work</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-400 max-w-2xl mx-auto"
            >
              No hidden fees. No massive commissions. Just fair, blockchain-secured transactions for everyone.
            </motion.p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {tiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-8 rounded-3xl border ${
                  tier.popular ? "border-blue-500 bg-blue-500/5 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]" : "border-white/10 bg-white/5"
                } flex flex-col`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{tier.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-zinc-500 ml-2 text-lg">fee per tx</span>}
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="mt-1 bg-emerald-500/20 p-0.5 rounded">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-6 rounded-xl font-bold ${
                    tier.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Fee Breakdown Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Info className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">Why the fee structure?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" /> Web2 High Commissions
                </h4>
                <p className="text-sm text-zinc-400">
                  Traditional platforms take up to 20% of your earnings. We believe that value should stay with the people who create it.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" /> Sustaining the Network
                </h4>
                <p className="text-sm text-zinc-400">
                  Our small 2.5% fee on client payments funds the AI verification nodes, decentralized storage, and development of the SmartHire protocol.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

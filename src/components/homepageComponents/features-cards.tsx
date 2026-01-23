"use client";

import { motion } from "framer-motion";
import { Users, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import React from "react";

const features = [
  {
    icon: Users,
    title: "Discover Top Talent",
    description: "Access a global pool of vetted freelancers and experts. Our smart matching algorithm connects you with the perfect skills for your project.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: FileText,
    title: "Seamless Contracts",
    description: "Create, manage, and track project milestones with our intuitive contract system. Clear terms and automated workflows keep everything on track.",
    color: "from-purple-500 to-indigo-400",
  },
  {
    icon: ShieldCheck,
    title: "Secure Escrow Payments",
    description: "Your funds are held securely in escrow and released only when milestones are met and approved. Trust and transparency are built-in.",
    color: "from-green-500 to-emerald-400",
  },
];

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="relative p-8 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl"
  >
    <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${color}`} />
    <div className="flex flex-col h-full">
      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-6`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-300 flex-grow">{description}</p>
      <a href="#" className="flex items-center mt-6 text-white font-semibold hover:text-cyan-300 transition-colors">
        Learn More <ArrowRight className="w-4 h-4 ml-2" />
      </a>
    </div>
  </motion.div>
);

export default function FeaturesCards() {
  return (
    <div className="w-full bg-[#0d1417] py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }} 
            className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            A Better Way to Build and Scale
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-3xl mx-auto">
            SmartHire provides the tools and talent you need to get work done, from quick projects to long-term engagements.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}

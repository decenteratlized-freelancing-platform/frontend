"use client";
import { motion } from "framer-motion";
import { Globe, Users, Cpu, Shield, Zap } from "lucide-react";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";

const values = [
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Breaking down borders to connect talent with opportunities regardless of geography or financial infrastructure."
  },
  {
    icon: Shield,
    title: "Trust through Structure",
    description: "Moving from 'Trust me' to 'Trust the Code'. Our smart contracts ensure terms are met and payments are secured."
  },
  {
    icon: Cpu,
    title: "AI-Enhanced Human Potential",
    description: "Using AI not to replace workers, but to verify skills, automate legal jargon, and match the best talent to the right jobs."
  },
  {
    icon: Zap,
    title: "Efficiency First",
    description: "Traditional hiring processes are slow and expensive. We use decentralization to make hiring instant and fair."
  }
];

export default function AboutPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Mission Hero */}
          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
            >
              Our Mission
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
            >
              Building the Infrastructure for <span className="text-blue-500">Autonomous Talent</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
            >
              SmartHire was born out of a simple observation: the current freelance economy is broken. 
              High fees, opaque feedback systems, and payment delays are the norm. We're using Web3 and AI to fix it.
            </motion.p>
          </div>

          {/* Vision Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">A New Paradigm of Work</h2>
              <p className="text-zinc-400 leading-relaxed">
                We believe that the future of work isn't just remote—it's decentralized. 
                Imagine a world where your reputation isn't tied to a single platform, where your 
                contracts are self-executing, and where your skills are verified by neutral AI nodes rather than subjective reviews.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users className="text-blue-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Community-Owned</h4>
                    <p className="text-sm text-zinc-500">A platform that evolves with its users through decentralized governance.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 border-2 border-blue-500/30 rounded-full border-dashed p-8"
                >
                  <div className="w-full h-full border-2 border-purple-500/30 rounded-full border-dashed" />
                </motion.div>
                <div className="absolute text-center px-8">
                  <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">SmartHire</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-32">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <value.icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import { DollarSign, Zap, Clock, TrendingUp, Shield, Award } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "Find top-tier talent at rates that fit your budget. Our platform minimizes overhead, passing the savings to you.",
  },
  {
    icon: Zap,
    title: "Hire in Minutes, Not Weeks",
    description: "Our AI-powered matching and streamlined process helps you find and hire the right freelancer in record time.",
  },
  {
    icon: Clock,
    title: "Flexible Engagements",
    description: "From short-term tasks to long-term collaborations, find the flexible talent you need to scale your business.",
  },
  {
    icon: TrendingUp,
    title: "Drive Growth",
    description: "Access specialized skills and on-demand talent to accelerate your projects and achieve your business goals faster.",
  },
  {
    icon: Shield,
    title: "Built-in Trust",
    description: "With blockchain-powered escrow and transparent contracts, you can hire with confidence and peace of mind.",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "Our vetting process and community-driven reviews ensure you work with the best professionals in their field.",
  }
];

export default function BenefitsSection() {
  return (
    <div className="w-full bg-black py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }} 
            className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Unlock Your Project's Potential
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-3xl mx-auto">
            Leverage our platform to gain a competitive edge. We provide the resources you need to succeed in a fast-paced digital world.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 h-auto flex flex-col justify-start items-start space-y-4 hover:scale-105 transition-transform duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <benefit.icon size={24} className="text-white/80" />
              </div>
              <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
              <p className="text-sm text-neutral-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

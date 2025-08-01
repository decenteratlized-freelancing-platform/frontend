"use client"

import { motion } from "framer-motion"
import { Brain, Shield, CreditCard, Globe, Zap, Lock, Users, TrendingUp, Coins } from "lucide-react"
import FeatureCard from "./feature-card"

const features = [
  {
    icon: Brain,
    title: "AI-Generated Contracts",
    description:
      "Smart contracts automatically generated based on project requirements, ensuring fair terms for both parties.",
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "Web3 users benefit from immutable blockchain storage while Web2 users get traditional database reliability.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Accept both cryptocurrency and fiat payments seamlessly with automatic conversion and escrow protection.",
  },
  {
    icon: Globe,
    title: "Web2 & Web3 Bridge",
    description: "The first platform to truly bridge traditional and decentralized freelancing ecosystems.",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description: "Lightning-fast payment processing with smart contract automation for milestone-based releases.",
  },
  {
    icon: Lock,
    title: "Escrow Protection",
    description: "Funds are securely held in smart contracts or traditional escrow until project completion.",
  },
  {
    icon: Users,
    title: "Global Talent Pool",
    description: "Connect with freelancers and clients worldwide, regardless of their preferred payment method.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Track project success rates, payment history, and reputation scores across both ecosystems.",
  },
  {
    icon: Coins,
    title: "Multi-Currency Support",
    description: "Support for 50+ cryptocurrencies and all major fiat currencies with real-time conversion.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Modern Freelancing
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of freelance platforms with cutting-edge technology that adapts to both
            traditional and decentralized workflows.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

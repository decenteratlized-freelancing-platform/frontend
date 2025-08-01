"use client"

import { motion } from "framer-motion"
import { FileText, Brain, Shield, CreditCard, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Create Project",
    description: "Post your project requirements and let our AI analyze the scope and complexity.",
  },
  {
    icon: Brain,
    title: "AI Contract Generation",
    description: "Our AI generates a smart contract tailored to your project with fair terms for both parties.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Contract is stored on blockchain for Web3 users or secure database for Web2 users.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Choose your preferred payment method - crypto or fiat, with automatic escrow protection.",
  },
  {
    icon: CheckCircle,
    title: "Project Completion",
    description: "Milestone-based releases ensure smooth project delivery and automatic payments.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
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
            How It{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From project creation to completion, our platform streamlines every step of the freelancing process with AI
            and blockchain technology.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full hidden lg:block" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex items-center gap-12 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                {/* Content */}
                <div className="flex-1 lg:max-w-md">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>

                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Step Number */}
                <div className="hidden lg:flex w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center text-white font-bold text-xl shadow-2xl">
                  {index + 1}
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 lg:max-w-md hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

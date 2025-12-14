"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import AnimatedCounter from "./animated-counter"
import { useRef } from "react"

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Transform values for folding effect
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 15])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3])

  return (
    <motion.section
      ref={ref}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32"
      style={{
        y,
        scale,
        rotateX,
        opacity,
        transformStyle: "preserve-3d",
        transformOrigin: "center top",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
        style={{
          y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]),
        }}
      />

      {/* Animated Background Shapes */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            y: useTransform(scrollYProgress, [0, 1], ["0%", "20%"]),
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            y: useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]),
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 0.7]),
        }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        style={{
          y: useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]),
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">AI-Powered Smart Contracts</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
        >
          The Future of{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Freelancing
          </span>
          <br />
          is Here
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Bridge Web2 and Web3 with AI-generated smart contracts, seamless crypto & fiat payments, and
          blockchain-secured agreements. The only platform you'll ever need.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
          >
            Start Building
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm bg-transparent"
          >
            Watch Demo
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={50000} suffix="+" />
            </div>
            <p className="text-gray-400">Active Users</p>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              $<AnimatedCounter end={10} suffix="M+" />
            </div>
            <p className="text-gray-400">Transactions</p>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={99} suffix="%" />
            </div>
            <p className="text-gray-400">Success Rate</p>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex justify-center items-center gap-8 mt-16 text-gray-400"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span>Blockchain Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>AI Powered</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

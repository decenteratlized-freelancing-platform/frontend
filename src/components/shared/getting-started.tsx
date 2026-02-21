"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Step {
  title: string
  description: string
  completed: boolean
  link: string
}

interface GettingStartedProps {
  steps: Step[]
  title?: string
}

export function GettingStarted({ steps, title = "Getting Started" }: GettingStartedProps) {
  const completedCount = steps.filter(s => s.completed).length
  const progress = (completedCount / steps.length) * 100

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden mb-8">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            {title}
          </CardTitle>
          <span className="text-sm text-zinc-400 font-medium">
            {completedCount}/{steps.length} Steps
          </span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={step.link}>
                <div className={`h-full group p-4 rounded-xl border transition-all duration-300 ${
                  step.completed 
                  ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" 
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-500" />
                    )}
                    {!step.completed && <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />}
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${step.completed ? "text-green-300" : "text-white"}`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

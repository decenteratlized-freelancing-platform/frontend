"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, MessageSquare, Phone, Mail } from "lucide-react"

const faqItems = [
  {
    question: "How do I find suitable projects?",
    answer: "Use the 'Browse Jobs' section to find projects that match your skills and interests.",
  },
  {
    question: "When do I get paid?",
    answer: "Payments are released when project milestones are completed and approved by the client.",
  },
  {
    question: "How do I build my profile?",
    answer: "Complete your profile with skills, portfolio items, and professional experience to attract clients.",
  },
  {
    question: "What if there's a dispute?",
    answer: "Our support team mediates disputes to ensure fair resolution for both parties.",
  },
]

export default function FreelancerSupport() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <HelpCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-white">Help & Support</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            How can we help?
          </span>
        </h1>
        <p className="text-xl text-gray-300">Get the support you need to grow your freelance career</p>
      </motion.div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: MessageSquare,
            title: "Live Chat",
            description: "Chat with our support team",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: Phone,
            title: "Phone Support",
            description: "Call us at +1 (555) 123-4567",
            color: "from-green-500 to-emerald-500",
          },
          {
            icon: Mail,
            title: "Email Support",
            description: "support@smarthire.com",
            color: "from-purple-500 to-pink-500",
          },
        ].map((option, index) => (
          <motion.div
            key={option.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                >
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{option.title}</h3>
                <p className="text-gray-300 text-sm">{option.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12"
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-200"
                >
                  <h4 className="font-semibold text-white mb-2">{item.question}</h4>
                  <p className="text-gray-300 text-sm">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Send us a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Name</label>
                <Input className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                <Input type="email" className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Subject</label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Message</label>
              <Textarea className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-32" />
            </div>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 w-full text-white">
              Send Message
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

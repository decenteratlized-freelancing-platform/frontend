"use client";
import { motion } from "framer-motion";
import { Search, HelpCircle, Book, MessageSquare, Shield, AlertTriangle } from "lucide-react";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How does the blockchain escrow work?",
    a: "When a client funds a contract, the ETH is held in a secure, audited smart contract on the Sepolia network. The funds are only released to the freelancer when milestones are approved or if both parties agree to release them."
  },
  {
    q: "What if there is a dispute?",
    a: "SmartHire has a built-in dispute resolution mechanism. If a milestone is rejected and the parties can't agree, the contract enters a 'Disputed' state. Our neutral mediators (or the community in future versions) review evidence and release funds based on the work completed."
  },
  {
    q: "Are my personal details private?",
    a: "Yes. SmartHire uses a 'Pseudonymous by Default' model. While skill verification is performed by AI, your real-world identity is only shared with clients you choose to work with, protected by our privacy-first architecture."
  }
];

export default function SupportPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-8"
            >
              How can we <span className="text-blue-500">help</span>?
            </motion.h1>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, and FAQs..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: Book, title: "Knowledge Base", text: "Deep dives into how the protocol works and platform guides." },
              { icon: MessageSquare, title: "Live Chat", text: "Connect with our support team for immediate assistance." },
              { icon: Shield, title: "Trust & Safety", text: "Learn about escrow, security, and dispute resolution." }
            ].map((cat, idx) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                  <cat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{cat.text}</p>
              </motion.div>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
              <HelpCircle className="text-blue-500" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5"
                >
                  <h4 className="text-lg font-bold mb-3">{faq.q}</h4>
                  <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Support Ticket CTA */}
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <AlertTriangle className="text-yellow-500 mx-auto mb-6 w-10 h-10" />
            <h2 className="text-2xl font-bold mb-4">Having an issue with a contract?</h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              If you&apos;re experiencing a technical bug or need to escalate a dispute, please open a formal support ticket.
            </p>
            <Button className="bg-white text-black hover:bg-neutral-200 rounded-xl px-8 py-6 font-bold" onClick={() => window.location.href='/support/tickets'}>
              Open Support Ticket
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

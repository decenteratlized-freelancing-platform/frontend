'use client';
import { motion } from "framer-motion";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";
import { Shield, Lock, Eye, Zap, Database, Globe } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "1. Information we Collect",
      content: "SmartHire is built on the principle of data minimization. We collect your wallet address to facilitate smart contract interactions. If you choose to link an email for notifications, we store it securely using AES-256 encryption. We do not track your physical location or real-world identity unless explicitly provided in your profile settings."
    },
    {
      icon: Globe,
      title: "2. Blockchain Transparency",
      content: "All smart contract interactions (funding, releasing milestones, disputes) are recorded on the public blockchain. This data is permanent and transparent by design. We strongly advise users to avoid putting sensitive personal information in job descriptions or milestone titles as they are immutable once on-chain."
    },
    {
      icon: Zap,
      title: "3. AI Data Processing",
      content: "When you use our AI skill verification or contract generation tools, the data you provide is processed by our secure AI nodes. This data is used solely to provide the requested service and improve our matching algorithms. We strictly do not sell your behavioral or personal data to third-party marketing entities."
    },
    {
      icon: Eye,
      title: "4. Cookies & Security",
      content: "We use essential session-only cookies to maintain your login state and CSRF security. We do not use intrusive tracking, cross-site pixels, or third-party marketing cookies. Your browsing activity on SmartHire remains private."
    },
    {
      icon: Lock,
      title: "5. Your Data Rights",
      content: "You have the absolute right to delete your account and any off-chain data we hold. However, due to the nature of blockchain technology, we cannot delete records of on-chain transactions or events. These are maintained by the network itself, independent of the SmartHire frontend."
    }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-white selection:text-black">
      <Navigation />
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-zinc-800" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-zinc-800" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-zinc-800" />
        <div className="absolute left-0 top-1/4 h-px w-full bg-zinc-800" />
        <div className="absolute left-0 top-2/4 h-px w-full bg-zinc-800" />
        <div className="absolute left-0 top-3/4 h-px w-full bg-zinc-800" />
      </div>

      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 mb-6">
              <Shield size={14} className="text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Legal & Security</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-none">
              Privacy <br /> Policy.
            </h1>
            <p className="text-zinc-500 text-lg max-w-2xl">
              Last updated: February 12, 2026. <br />
              We are committed to protecting your digital identity and on-chain assets.
            </p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((section, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl"
              >
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-white shrink-0">
                    <section.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-white tracking-tight">{section.title}</h2>
                    <p className="text-zinc-400 leading-relaxed text-justify text-sm sm:text-base">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-20 p-8 border border-zinc-800 rounded-3xl text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">Have questions?</h3>
            <p className="text-zinc-500 text-sm mb-6">Our security team is here to help with any data concerns.</p>
            <a href="mailto:security@smarthire.com" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all">
              Contact Security Team
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

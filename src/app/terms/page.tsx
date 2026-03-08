'use client';
import { motion } from "framer-motion";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";
import { Gavel, Scale, AlertTriangle, UserCheck, Ban, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: UserCheck,
      title: "1. Acceptance of Terms",
      content: "By accessing or using SmartHire, you agree to be bound by these Terms of Service and all applicable laws and regulations. Our platform utilizes decentralized protocols and smart contracts. By interacting with these, you acknowledge the inherent risks of blockchain technology, including permanent transactions and market volatility."
    },
    {
      icon: ShieldCheck,
      title: "2. The SmartHire Protocol",
      content: "SmartHire is a non-custodial interface. We do not hold your funds, private keys, or control your digital assets. All payments are processed via self-executing smart contracts on the Ethereum/Sepolia network. You are solely responsible for managing your own private keys and maintaining the security of your hardware/software wallets."
    },
    {
      icon: Scale,
      title: "3. AI & Verification",
      content: "Our AI systems provide skill verification and contract generation services. While we strive for maximum accuracy, these systems are provided 'as-is'. Users are required to review all AI-generated contract terms, milestone definitions, and payment schedules before funding a project. SmartHire is not liable for errors in AI interpretation."
    },
    {
      icon: Gavel,
      title: "4. Dispute Resolution",
      content: "In the event of a conflict, users agree to utilize the integrated SmartHire dispute resolution mechanism. This protocol involves evidence submission and potentially decentralized mediation. By using the platform, you agree to abide by the final on-chain resolution dictated by the governing smart contracts."
    },
    {
      icon: Ban,
      title: "5. Prohibited Activities",
      content: "Users are strictly prohibited from using the platform for money laundering, illegal services, harassment, or fraudulent recruitment. We reserve the right to blacklist wallet addresses and delete off-chain profiles that violate these standards or damage the integrity of the SmartHire ecosystem."
    }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-white selection:text-black">
      <Navigation />
      
      {/* Background Grid */}
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
              <Gavel size={14} className="text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Legal Agreement</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-none">
              Terms of <br /> Service.
            </h1>
            <p className="text-zinc-500 text-lg max-w-2xl">
              Last updated: February 12, 2026. <br />
              Please review the governing rules of the SmartHire decentralized protocol.
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
          </div>
          </main>

          <Footer />
          </div>
          );
          }

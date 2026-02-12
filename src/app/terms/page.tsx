"use client";
import { motion } from "framer-motion";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";

export default function TermsPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms of Service</h1>
            <p className="text-zinc-500">Last updated: February 12, 2026</p>
          </motion.div>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                By accessing or using SmartHire, you agree to be bound by these Terms of Service. 
                Our platform uses decentralized protocols and smart contracts. By interacting with these, 
                you acknowledge the inherent risks of blockchain technology.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. The SmartHire Protocol</h2>
              <p className="text-zinc-400 leading-relaxed">
                SmartHire is a non-custodial platform. We do not hold your funds. All payments are 
                processed via self-executing smart contracts on the Ethereum/Sepolia network. 
                You are responsible for managing your own private keys and wallet security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. AI Verification</h2>
              <p className="text-zinc-400 leading-relaxed">
                Our AI systems provide skill verification and contract generation. While we strive 
                for 100% accuracy, these systems are provided "as-is". Users should review all 
                AI-generated contract terms before funding a job.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Dispute Resolution</h2>
              <p className="text-zinc-400 leading-relaxed">
                In the event of a dispute, users agree to abide by the decision of the SmartHire 
                dispute resolution mechanism. This may involve human mediators or decentralized 
                voting systems depending on the contract type.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Prohibited Activities</h2>
              <p className="text-zinc-400 leading-relaxed">
                Users may not use the platform for illegal activities, money laundering, or 
                harassment. We reserve the right to blacklist wallet addresses that violate 
                these terms from our frontend interface.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

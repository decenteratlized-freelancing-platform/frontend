"use client";
import { motion } from "framer-motion";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";

export default function PrivacyPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-zinc-500">Last updated: February 12, 2026</p>
          </motion.div>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                SmartHire is built on the principle of data minimization. We collect your wallet 
                address to facilitate smart contract interactions. If you choose to link an email 
                for notifications, we store it securely. We do not track your physical location 
                or real-world identity unless you explicitly provide it in your profile.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Blockchain Transparency</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                Please be aware that all smart contract interactions (funding, releasing milestones, 
                disputes) are recorded on the public blockchain. This data is permanent and 
                transparent by design. Avoid putting sensitive personal information in job 
                descriptions or milestone titles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. AI Data Processing</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                When you use our AI skill verification or contract generation tools, the data 
                you provide is processed by our secure AI nodes. This data is used solely to 
                provide the requested service and improve our matching algorithms. We do not 
                sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                We use essential cookies to maintain your session and security. We do not use 
                intrusive tracking or third-party marketing cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                You have the right to delete your account and any off-chain data we hold. However, 
                due to the nature of blockchain technology, we cannot delete records of on-chain 
                transactions.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

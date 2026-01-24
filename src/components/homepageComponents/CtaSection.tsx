"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CtaSection() {
  return (
    <div className="w-full bg-black py-24 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Join the future of freelance work today. Sign up as a client or freelancer and take the next step in your professional journey.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/client/post-job" passHref>
              <Button className="text-base px-8 py-6 rounded-xl bg-white text-black border border-white/10 shadow-lg hover:bg-white/90 transition-transform hover:scale-105">
                Post a Job
              </Button>
            </Link>
            <Link href="/freelancer/browse-jobs" passHref>
              <Button variant="outline" className="text-base px-8 py-6 rounded-xl bg-transparent text-white border-white/20 shadow-lg hover:bg-white/10 hover:scale-105 transition-transform hover:text-white">
                Find Work
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Warp } from "@paper-design/shaders-react";

export default function CtaSection() {
  return (
    <div className="relative w-full bg-black py-24 px-8 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-60">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(200, 100%, 20%)", "hsl(160, 100%, 75%)", "hsl(180, 90%, 30%)", "hsl(170, 100%, 80%)"]}
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
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

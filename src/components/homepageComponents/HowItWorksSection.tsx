"use client";
import { motion } from "framer-motion";
import { UserPlus, FileText, Briefcase, Award } from "lucide-react";
import React from "react";
import ParticleCanvas from "./ParticleCanvas";

const steps = [
  {
    icon: UserPlus,
    title: "1. Create Your Profile",
    description: "Sign up and build a profile to showcase your skills or project needs.",
  },
  {
    icon: FileText,
    title: "2. Post or Find a Job",
    description: "Clients post jobs, and freelancers find opportunities matching their expertise.",
  },
  {
    icon: Briefcase,
    title: "3. Collaborate Securely",
    description: "Use our tools to communicate, share files, and track progress with escrow protection.",
  },
  {
    icon: Award,
    title: "4. Achieve Your Goals",
    description: "Complete projects, get paid, and build your reputation through reviews.",
  },
];

export default function HowItWorksSection() {
  return (
    <div id="how-it-works" className="relative w-full bg-transparent text-white py-24 px-8 z-10">
      <ParticleCanvas />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-3xl mx-auto">
            A simple, streamlined process for secure and effective collaboration.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <TiltCard key={idx} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}

const TiltCard = ({ step }: { step: (typeof steps)[0] }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    setRotateX(yPct * -25);
    setRotateY(xPct * 25);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="relative rounded-xl bg-neutral-900/80 border border-neutral-800 p-8"
    >
      <motion.div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col items-center text-center"
      >
        <div
          style={{ transform: "translateZ(40px)" }}
          className="w-14 h-14 rounded-full flex items-center justify-center bg-neutral-800 border border-neutral-700 mb-4"
        >
          <step.icon size={28} className="text-white/80" />
        </div>
        <h3
          style={{ transform: "translateZ(75px)" }}
          className="text-xl font-semibold text-white mb-2"
        >
          {step.title}
        </h3>
        <p
          style={{ transform: "translateZ(55px)" }}
          className="text-sm text-neutral-400"
        >
          {step.description}
        </p>
      </motion.div>
    </div>
  );
};
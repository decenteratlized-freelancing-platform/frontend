"use client";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Search, Rocket, Heart, Brain } from "lucide-react";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";
import { Button } from "@/components/ui/button";

const jobs = [
  {
    title: "Senior Smart Contract Engineer",
    department: "Engineering",
    location: "Remote / Global",
    type: "Full-time"
  },
  {
    title: "AI Researcher (NLU)",
    department: "AI & Protocol",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Product Designer",
    department: "Product",
    location: "Remote / London / NY",
    type: "Full-time"
  },
  {
    title: "Community Growth Manager",
    department: "Growth",
    location: "Remote",
    type: "Full-time"
  }
];

export default function CareersPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              Shape the <span className="text-blue-500">Protocol of Talent</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10"
            >
              Join a team of builders, researchers, and designers creating the decentralized future of work. 
              We're fully remote, results-oriented, and obsessed with user experience.
            </motion.p>
            <Button size="lg" className="rounded-full px-8 py-6 bg-blue-600 hover:bg-blue-700 text-lg font-bold">
              View Openings
            </Button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { icon: Rocket, title: "Equity & Tokens", text: "Competitive salary with stock options and $HIRE token grants." },
              { icon: Heart, title: "Fully Remote", text: "Work from anywhere in the world. We value output over office hours." },
              { icon: Brain, title: "Lifelong Learning", text: "Annual budget for books, courses, and conferences." }
            ].map((perk, idx) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                  <perk.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{perk.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{perk.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Open Roles */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Open Roles</h2>
                <p className="text-zinc-500">Help us build the decentralized talent infrastructure.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search roles..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.department}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl border-white/10 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                    Apply Now
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Spontaneous Application */}
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Don't see a role that fits?</h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              We're always looking for talented engineers, designers, and thinkers who are passionate about decentralization.
            </p>
            <Button className="bg-white text-black hover:bg-neutral-200 rounded-xl px-8 py-6 font-bold">
              Send a Spontaneous Application
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

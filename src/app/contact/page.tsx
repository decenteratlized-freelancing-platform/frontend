"use client";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Twitter, Github, MapPin } from "lucide-react";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Left: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in <span className="text-blue-500">Touch</span></h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                  Have questions about the protocol? Need support with a contract? Or just want to say hello? 
                  We&apos;re here to help the decentralized community thrive.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Email Us</h4>
                    <p className="text-zinc-500 mb-2">For general inquiries and partnerships.</p>
                    <a href="mailto:hello@smarthire.app" className="text-blue-400 hover:underline font-medium">hello@smarthire.app</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-500">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Join the Community</h4>
                    <p className="text-zinc-500 mb-4">Chat with the team and other users in real-time.</p>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm" className="rounded-xl border-white/10 gap-2">
                        <Twitter size={16} /> Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl border-white/10 gap-2">
                        <Github size={16} /> GitHub
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Office</h4>
                    <p className="text-zinc-500">Fully decentralized, with core contributors in London, New York, and Singapore.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -z-10" />
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-zinc-400">First Name</Label>
                    <Input id="first-name" placeholder="Vitalik" className="bg-white/5 border-white/10 rounded-xl py-6" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-zinc-400">Last Name</Label>
                    <Input id="last-name" placeholder="Buterin" className="bg-white/5 border-white/10 rounded-xl py-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
                  <Input id="email" type="email" placeholder="vitalik@ethereum.org" className="bg-white/5 border-white/10 rounded-xl py-6" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-zinc-400">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" className="bg-white/5 border-white/10 rounded-xl py-6" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-400">Message</Label>
                  <textarea 
                    id="message" 
                    rows={5} 
                    placeholder="Tell us more about your inquiry..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[150px] resize-none"
                  />
                </div>

                <Button className="w-full py-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold">
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import { Zap, Twitter, Linkedin, Github, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const footerLinks = [
    {
        title: "Platform",
        links: [
            { name: "Find Talent", href: "/client/discover" },
            { name: "Find Work", href: "/freelancer/browse-jobs" },
            { name: "How It Works", href: "#how-it-works" },
            { name: "Pricing", href: "/pricing" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About Us", href: "/about" },
            { name: "Careers", href: "/careers" },
            { name: "Contact", href: "/contact" },
            { name: "Support", href: "/support" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Terms of Service", href: "/terms" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Cookie Policy", href: "/cookies" },
        ],
    },
];

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for newsletter logic
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <footer className="w-full bg-black border-t border-white/10 pt-20 pb-10 px-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 blur-sm" />
        
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2 inline-block">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-2xl tracking-tight">SmartHire</span>
            </Link>
            <p className="text-neutral-400 leading-relaxed max-w-sm">
              The decentralized hiring platform connecting ambitious clients with elite global talent. Secure, transparent, and built for the future of work.
            </p>
            <div className="flex items-center gap-4">
                {socialLinks.map((link, idx) => (
                    <Link 
                        key={idx} 
                        href={link.href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-all duration-300 group"
                        aria-label={link.label}
                    >
                        <link.icon size={18} className="group-hover:scale-110 transition-transform" />
                    </Link>
                ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
                <div key={section.title}>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{section.title}</h3>
                    <ul className="space-y-3">
                        {section.links.map((link) => (
                            <li key={link.name}>
                                <Link 
                                    href={link.href} 
                                    className="text-sm text-neutral-400 hover:text-blue-400 transition-colors duration-200"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-sm text-neutral-400 mb-6">
                Join our newsletter for the latest platform updates and freelance tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-neutral-600"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-white text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 group"
                >
                    Subscribe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">
                &copy; {new Date().getFullYear()} SmartHire Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-sm text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    All Systems Operational
                </span>
            </div>
        </div>
      </div>
    </footer>
  );
}

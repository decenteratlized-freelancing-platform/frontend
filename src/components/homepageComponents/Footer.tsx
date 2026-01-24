"use client";
import { motion } from "framer-motion";
import { Zap, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";

const footerLinks = [
    {
        title: "Platform",
        links: [
            { name: "Find Talent", href: "/client/discover" },
            { name: "Find Work", href: "/freelancer/browse-jobs" },
            { name: "How It Works", href: "#how-it-works" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About Us", href: "/about" },
            { name: "Contact", href: "/contact" },
            { name: "Support", href: "/support" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Terms of Service", href: "/terms" },
            { name: "Privacy Policy", href: "/privacy" },
        ],
    },
];

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com" },
    { icon: Linkedin, href: "https://linkedin.com" },
    { icon: Github, href: "https://github.com" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">SmartHire</span>
            </Link>
            <p className="text-sm text-neutral-400 mt-4">
              The decentralized platform for ambitious clients and elite freelancers.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                        {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} SmartHire. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            {socialLinks.map((link, idx) => (
              <Link key={idx} href={link.href} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  <link.icon size={20} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

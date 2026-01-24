"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    quote: "SmartHire revolutionized how we build our team. The quality of talent and the security of the platform are unmatched.",
    name: "Jane Doe",
    title: "CEO, Tech Innovators",
    avatar: "/avatars/jane-doe.png",
  },
  {
    quote: "As a freelancer, finding consistent work and getting paid on time was always a challenge. SmartHire has solved both.",
    name: "John Smith",
    title: "Senior Developer",
    avatar: "/avatars/john-smith.png",
  },
  {
    quote: "The transparency of the smart contracts gives me peace of mind. I can focus on the work, knowing that the terms are clear and payments are guaranteed.",
    name: "Emily White",
    title: "UX/UI Designer",
    avatar: "/avatars/emily-white.png",
  },
];

export default function TestimonialsSection() {
  return (
    <div className="w-full bg-black py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }} 
            className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Loved by Teams and Individuals
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-3xl mx-auto">
            See what our users are saying about their experience on SmartHire.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 h-auto flex flex-col justify-start items-start space-y-4"
            >
              <p className="text-lg text-white">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4 pt-4">
                {/* <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                /> */}
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-neutral-400">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import Navigation from "@/components/homepageComponents/navigation";
import Footer from "@/components/homepageComponents/Footer";

export default function CookiesPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Cookie Policy</h1>
            <p className="text-zinc-500">Last updated: February 12, 2026</p>
          </motion.div>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">What are cookies?</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                Cookies are small text files that are stored on your computer or mobile device 
                when you visit a website. They are widely used to make websites work more 
                efficiently and to provide a better user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How we use them</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                SmartHire only uses **strictly necessary** cookies. These are required for the 
                security and basic functionality of the platform, such as maintaining your 
                authentication session and CSRF protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">No tracking</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                Unlike many traditional platforms, we do not use cookies for advertising, 
                behavioral tracking, or cross-site analytics. We value your privacy and aim 
                to keep our digital footprint as small as possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Managing cookies</h2>
              <p className="text-zinc-400 leading-relaxed text-justify">
                You can control and/or delete cookies as you wish. You can delete all cookies 
                that are already on your computer and you can set most browsers to prevent 
                them from being placed. If you do this, however, you may have to manually 
                adjust some preferences every time you visit a site and some services and 
                functionalities (like logging in) may not work.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

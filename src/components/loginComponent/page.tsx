'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Github, ArrowRight, Shield, Coins, Zap, CheckCircle2, Globe, ArrowLeft, Mail, Lock, User, Briefcase, Building2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const router = useRouter();
  const [viewState, setViewState] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'freelancer'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth`;

    try {
      if (viewState === 'forgot') {
        if (!formData.email) throw new Error("Please enter your email");
        const res = await fetch(`${apiUrl}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to send reset email");
        setStatusMessage({ type: "success", text: "Reset link sent to your email!" });
        setLoading(false);
        return;
      }

      if (viewState === 'login') {
        if (!formData.email || !formData.password) throw new Error("Please fill all fields");
        const res = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatusMessage({ type: "success", text: "Welcome back! Redirecting..." });
          localStorage.clear();
          localStorage.setItem("loginType", "manual");
          if (data.token) localStorage.setItem("token", data.token);
          localStorage.setItem("fullName", data.user?.fullName || "");
          localStorage.setItem("email", data.user?.email || "");
          localStorage.setItem("role", data.user?.role || "");
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          setTimeout(() => {
            const role = data.user?.role;
            router.replace(role === "client" ? "/client/dashboard" : role === "freelancer" ? "/freelancer/dashboard" : "/choose-role");
          }, 1000);
        } else {
          throw new Error(data.message || "Invalid credentials");
        }
      } else if (viewState === 'register') {
        if (!formData.email || !formData.password || !formData.fullName) throw new Error("All fields are required");
        if (formData.password.length < 6) throw new Error("Password must be 6+ characters");
        const res = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role || "freelancer",
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatusMessage({ type: "success", text: "Account created! You can now log in." });
          setTimeout(() => setViewState('login'), 1500);
        } else {
          throw new Error(data.message || "Registration failed");
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: `/auth-callback${viewState === 'register' ? `?intentRole=${formData.role}` : ''}` });
  };

  const handleGithubAuth = () => {
    signIn('github', { callbackUrl: `/auth-callback${viewState === 'register' ? `?intentRole=${formData.role}` : ''}` });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-zinc-800" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-zinc-800" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-zinc-800" />
        <div className="absolute left-0 top-1/4 h-px w-full bg-zinc-800" />
        <div className="absolute left-0 top-2/4 h-px w-full bg-zinc-800" />
        <div className="absolute left-0 top-3/4 h-px w-full bg-zinc-800" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-inner">
                <Image src="/logo-w-removebg-preview.png" alt="SmartHire" width={32} height={32} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">SmartHire</span>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6 text-white">
              The future of <br /> 
              <span className="text-zinc-500 underline decoration-zinc-700 underline-offset-8">decentralized</span> work.
            </h2>
            
            <p className="text-zinc-400 text-lg max-w-sm mb-12">
              Elite talent meets ambitious projects in a secure, transparent environment.
            </p>

            <div className="space-y-6 mb-12">
              {[
                { icon: Shield, title: "Secured by Smart Contracts", desc: "Your payments are always safe." },
                { icon: Zap, title: "Instant Settlements", desc: "Get paid the moment you finish." },
                { icon: Globe, title: "Global Opportunities", desc: "Work with anyone, anywhere." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 p-2 bg-zinc-800 rounded-lg">
                    <item.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex gap-4 text-zinc-600">
              <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer text-xs">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors cursor-pointer text-xs">Terms</Link>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 sm:p-12 bg-zinc-950 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="lg:hidden flex justify-center mb-8">
               <Image src="/logo-w-removebg-preview.png" alt="SmartHire" width={48} height={48} />
            </div>

            <div className="text-center lg:text-left mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                {viewState === 'login' && 'Welcome Back'}
                {viewState === 'register' && 'Create Account'}
                {viewState === 'forgot' && 'Reset Access'}
              </h1>
              <p className="text-zinc-500">
                {viewState === 'login' && 'Please enter your details to sign in.'}
                {viewState === 'register' && 'Join the next generation of elite builders.'}
                {viewState === 'forgot' && 'Enter your email to receive a secure link.'}
              </p>
            </div>

            {viewState !== 'forgot' && (
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button 
                  onClick={handleGoogleAuth}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-sm font-bold text-black"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button 
                  onClick={handleGithubAuth}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 border border-zinc-200 rounded-xl hover:bg-zinc-200 transition-all text-sm font-bold text-black"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </button>
              </div>
            )}

            {viewState !== 'forgot' && (
              <div className="relative mb-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                <span className="relative bg-zinc-950 px-4 text-xs font-bold text-zinc-700 uppercase tracking-widest">Or continue with email</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {viewState === 'register' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5"
                  >
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-12 py-3.5 text-white focus:outline-none focus:border-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={() => setFormData({...formData, role: 'freelancer'})}
                        className={`cursor-pointer p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.role === 'freelancer' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-transparent opacity-60'}`}
                      >
                        <Briefcase size={18} className={formData.role === 'freelancer' ? 'text-white' : 'text-zinc-600'} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Freelancer</span>
                      </div>
                      <div 
                        onClick={() => setFormData({...formData, role: 'client'})}
                        className={`cursor-pointer p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.role === 'client' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-transparent opacity-60'}`}
                      >
                        <Building2 size={18} className={formData.role === 'client' ? 'text-white' : 'text-zinc-600'} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Client</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-12 py-3.5 text-white focus:outline-none focus:border-white transition-all"
                />
              </div>

              {viewState !== 'forgot' && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-12 py-3.5 pr-12 text-white focus:outline-none focus:border-white transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              {viewState === 'login' && (
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setViewState('forgot')}
                    className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {statusMessage.text && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                    statusMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}
                >
                  {statusMessage.type === 'error' ? <Zap size={14} /> : <CheckCircle2 size={14} />}
                  {statusMessage.text}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 relative overflow-hidden group active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 uppercase tracking-widest text-xs">
                      {viewState === 'login' && 'Enter SmartHire'}
                      {viewState === 'register' && 'Begin Journey'}
                      {viewState === 'forgot' && 'Send Recovery Email'}
                    </span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              {viewState === 'forgot' ? (
                <button 
                  onClick={() => setViewState('login')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} /> Return to Login
                </button>
              ) : (
                <button 
                  onClick={() => setViewState(viewState === 'login' ? 'register' : 'login')}
                  className="text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  {viewState === 'login' ? "New to the platform? Create account" : "Already a member? Sign in"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Github, ArrowRight, Shield, Coins, Zap, CheckCircle2, Globe, Users, ArrowLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const router = useRouter();
  const [viewState, setViewState] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [authState, setAuthState] = useState<{ loading: boolean; successUser: any; error: string | null }>({
    loading: false,
    successUser: null,
    error: null,
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    role: 'freelancer'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState({ loading: true, successUser: null, error: null });
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
        setAuthState({ loading: false, successUser: null, error: null });
        return;
      }

      if (!formData.email || !formData.password || (viewState === 'register' && !formData.fullName)) {
        throw new Error("Please fill all required fields");
      }

      if (viewState === 'register' && formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (viewState === 'login') {
        const res = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await res.json();

        if (res.ok && data.requiresOTP) {
          // OTP sent - redirect to verification page
          setAuthState({ loading: false, successUser: null, error: null });
          setStatusMessage({ type: "success", text: "OTP generated! Redirecting to verification..." });

          setTimeout(() => {
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          }, 1200);
        } else if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }
      } else if (viewState === 'register') {
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
          setAuthState({ loading: false, successUser: null, error: null });
          setStatusMessage({ type: "success", text: "Account created! Please login to continue." });
          // Switch to login view after successful registration
          setTimeout(() => setViewState('login'), 1500);
        } else {
          throw new Error(data.message || "Registration failed");
        }
      }
    } catch (err: any) {
      setAuthState({ loading: false, successUser: null, error: err.message });
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "RoleMismatch") {
      setStatusMessage({
        type: "error",
        text: "Account exists with a different role."
      });
    }
  }, []);

  const handleGoogleAuth = () => {
    const callbackUrl = `/auth-callback${viewState === 'register' ? `?intentRole=${formData.role}` : ''}`;
    signIn('google', { callbackUrl });
  };

  const handleGithubAuth = () => {
    const callbackUrl = `/auth-callback${viewState === 'register' ? `?intentRole=${formData.role}` : ''}`;
    signIn('github', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">

      {/* LEFT SIDE - FORM (55%) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-12 xl:px-24 py-12">

        <motion.div
          key={viewState}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg mx-auto"
        >
          {/* Brand Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo-w-removebg-preview.png"
                alt="SmartHire Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <span className="text-2xl font-bold tracking-tight">SmartHire</span>
            </div>

            <h1 className="text-4xl font-bold mb-3">
              {viewState === 'login' && 'Welcome back'}
              {viewState === 'register' && 'Join the revolution'}
              {viewState === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-zinc-500 text-lg">
              {viewState === 'forgot'
                ? 'Enter your email to receive a reset link.'
                : 'The most secure decentralized platform for elite talent.'}
            </p>
          </div>

          {viewState !== 'forgot' && (
            <>
              {/* Social Auth */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={handleGoogleAuth}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all font-medium text-sm text-zinc-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  onClick={handleGithubAuth}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all font-medium text-sm text-zinc-300"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest text-zinc-600 font-bold">
                  <span className="bg-black px-4">Or use your email</span>
                </div>
              </div>
            </>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {viewState === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="e.g. Satoshi Nakamoto"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">I want to</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setFormData({ ...formData, role: 'freelancer' })}
                        className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.role === 'freelancer' ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <Zap size={20} className={formData.role === 'freelancer' ? 'text-yellow-400' : ''} />
                        <span className="text-sm font-bold">Work & Earn</span>
                      </div>
                      <div
                        onClick={() => setFormData({ ...formData, role: 'client' })}
                        className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.role === 'client' ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <Globe size={20} className={formData.role === 'client' ? 'text-blue-400' : ''} />
                        <span className="text-sm font-bold">Hire Talent</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="name@company.com"
              />
            </div>

            {viewState !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
                  {viewState === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setViewState('forgot'); setStatusMessage({ type: '', text: '' }); }}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {statusMessage.text && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${statusMessage.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                }`}>
                {statusMessage.type === 'error' ? '✕' : <CheckCircle2 size={16} />}
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={authState.loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
            >
              {authState.loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {viewState === 'login' && 'Enter Platform'}
                  {viewState === 'register' && 'Create Account'}
                  {viewState === 'forgot' && 'Send Reset Link'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            {viewState === 'forgot' ? (
              <button
                onClick={() => { setViewState('login'); setStatusMessage({ type: '', text: '' }); }}
                className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors w-full"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            ) : (
              <button
                onClick={() => {
                  setViewState(viewState === 'login' ? 'register' : 'login');
                  setStatusMessage({ type: '', text: '' });
                  setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                }}
                className="text-sm font-bold text-zinc-500 hover:text-white transition-colors"
              >
                {viewState === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            )}
          </div>

          {/* Value Highlights (Only on Login/Register) */}
          {viewState !== 'forgot' && (
            <div className="mt-12 grid grid-cols-3 gap-6 pt-12 border-t border-zinc-900">
              <div className="space-y-1">
                <Shield size={20} className="text-zinc-400" />
                <h4 className="text-xs font-bold text-white">Secure Escrow</h4>
                <p className="text-[10px] text-zinc-600">Blockchain backed safety.</p>
              </div>
              <div className="space-y-1">
                <Coins size={20} className="text-zinc-400" />
                <h4 className="text-xs font-bold text-white">Low Fees</h4>
                <p className="text-[10px] text-zinc-600">Keep more of your earnings.</p>
              </div>
              <div className="space-y-1">
                <Zap size={20} className="text-zinc-400" />
                <h4 className="text-xs font-bold text-white">Instant Pay</h4>
                <p className="text-[10px] text-zinc-600">Automatic settlements.</p>
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* RIGHT SIDE - IMAGE (45%) */}
      <div className="hidden lg:block lg:w-[45%] relative bg-zinc-900">
        <Image
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop"
          alt="Blockchain Technology"
          fill
          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />

        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Trusted by 10k+ users</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Empowering the next <br />
            generation of builders.
          </h2>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;

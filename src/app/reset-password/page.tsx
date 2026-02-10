'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

import Image from 'next/image';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ loading: false, type: '', text: '' });

    useEffect(() => {
        if (!token) {
            setStatus({ loading: false, type: 'error', text: 'Invalid or missing reset token.' });
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus({ loading: false, type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (password.length < 6) {
            setStatus({ loading: false, type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setStatus({ loading: true, type: '', text: '' });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to reset password");

            setStatus({ loading: false, type: 'success', text: 'Password reset successful! Redirecting...' });
            
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setStatus({ loading: false, type: 'error', text: err.message });
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
                <p className="text-zinc-400 mb-6">This password reset link is invalid or has expired.</p>
                <button 
                    onClick={() => router.push('/login')}
                    className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
             <div className="mb-12">
                 <div className="flex items-center gap-3 mb-6">
                    <Image
                        src="/logo-w-removebg-preview.png"
                        alt="SmartHire Logo"
                        width={50}
                        height={50}
                        className="object-contain"
                    />
                    <span className="text-2xl font-bold tracking-tight text-white">SmartHire</span>
                 </div>
                 
                 <h1 className="text-4xl font-bold mb-3 text-white">Reset Password</h1>
                 <p className="text-zinc-500 text-lg">Enter your new secure password below.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Password</label>
                   <div className="relative">
                     <input
                       type={showPassword ? 'text' : 'password'}
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-white transition-colors"
                       placeholder="••••••••"
                       required
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

                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Confirm Password</label>
                   <input
                       type={showPassword ? 'text' : 'password'}
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                       placeholder="••••••••"
                       required
                   />
                </div>

                {status.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
                    status.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {status.type === 'error' ? '✕' : <CheckCircle2 size={16} />}
                    {status.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  {status.loading ? 'Updating...' : (
                    <>
                        Reset Password <ArrowRight size={20} />
                    </>
                  )}
                </button>
             </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col justify-center px-6">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

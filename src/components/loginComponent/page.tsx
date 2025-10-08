'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Github } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
const LoginPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
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

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.29.100:5000'}/api/auth`;

    try {
      // Basic validation
      if (!formData.email || !formData.password || (!isLogin && !formData.fullName)) {
        setAuthState({ loading: false, successUser: null, error: "Please fill all required fields" });
        setStatusMessage({ type: "error", text: "Please fill all required fields" });
        return;
      }

      if (isLogin) {
        // LOGIN
        const res = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await res.json();

        if (res.ok) {
          const user = data.user;
          // persist token / user returned by backend
          localStorage.setItem("loginType", "manual");
          if (data.token) localStorage.setItem("token", data.token);
          localStorage.setItem("fullName", user?.fullName || "");
          localStorage.setItem("email", user?.email || "");
          localStorage.setItem("role", user?.role || "");
          localStorage.setItem("currentUser", JSON.stringify(user));

          setAuthState({ loading: false, successUser: user, error: null });
          setStatusMessage({ type: "success", text: "Login successful" });

          // navigate to role page
          router.push(user?.role === "client" ? "/client/dashboard" : "/freelancer/dashboard");
        } else {
          setAuthState({ loading: false, successUser: null, error: data.message || "Login failed" });
          setStatusMessage({ type: "error", text: data.message || "Login failed" });
          
          // If email not verified, show resend option
          if (data.emailNotVerified) {
            setStatusMessage({ 
              type: "error", 
              text: data.message + " Click 'Resend Verification' below to send a new email." 
            });
          }
        }
      } else {
        // SIGNUP / REGISTER
        console.log("Sending registration request to:", `${apiUrl}/register`);
        const requestBody = JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role || "freelancer",
            settings: {
              phone: "",
              bio: "",
              skills: "",
              notifications: { email: true, push: false, sms: true, marketing: false },
              privacy: { profileVisible: true, showEmail: false, showPhone: false, allowMessages: true },
              preferences: { language: "en", timezone: "utc", currency: "usd", theme: "dark" },
            },
          });
        
        console.log("Request body:", requestBody);
        
        const res = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });

        console.log("Response status:", res.status);
        console.log("Response headers:", res.headers);
        
        const data = await res.json();
        console.log("Response data:", data);

        if (res.ok) {
          setAuthState({ loading: false, successUser: null, error: null });
          setStatusMessage({ type: "success", text: data.message || "Registration successful! Please check your email to verify your account." });
          // switch to login view and clear form password fields
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } else {
          setAuthState({ loading: false, successUser: null, error: data.message || "Registration failed" });
          setStatusMessage({ type: "error", text: data.message || "Registration failed" });
        }
      }
    } catch (err: any) {
      console.error("Error:", err);
      setAuthState({ loading: false, successUser: null, error: err.message || "Something went wrong" });
      setStatusMessage({ type: "error", text: err.message || "Something went wrong" });
    }
  };


  const handleGoogleAuth = () => {
  signIn('google', { callbackUrl: '/choose-role' });
};

  const handleGithubAuth = () => {
  signIn('github', { callbackUrl: '/choose-role' });
};

const handleResendVerification = async () => {
  if (!formData.email) {
    setStatusMessage({ type: "error", text: "Please enter your email address first" });
    return;
  }

  setAuthState({ loading: true, successUser: null, error: null });
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.29.100:5000'}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatusMessage({ type: "success", text: data.message || "Verification email sent successfully!" });
    } else {
      setStatusMessage({ type: "error", text: data.message || "Failed to send verification email" });
    }
  } catch (err: any) {
    setStatusMessage({ type: "error", text: "Network error. Please try again." });
  }
  
  setAuthState({ loading: false, successUser: null, error: null });
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen">
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  SmartHire
                </h1>
                <p className="text-gray-600 text-sm">Blockchain-Backed Freelance Platform</p>
              </div>

              <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>
                  <div className="space-y-4 mb-6">
                <button
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 font-medium text-gray-700 hover:text-blue-600"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={handleGithubAuth}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                >
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </button>
              </div>
              {/* Status Message */}
              {statusMessage.text && (
                <div
                  className={`text-sm font-medium text-center mb-4 ${
                    statusMessage.type === 'error' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <div className="space-y-6">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium text-gray-700">Select Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                      >
                        <option value="freelancer">Freelancer</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={authState.loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:scale-105 transition-all"
                >
                  {authState.loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </div>

              {isLogin && (
                <div className="mt-6 text-center space-y-3">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium block">
                    Forgot your password?
                  </a>
                  <button
                    onClick={handleResendVerification}
                    disabled={authState.loading}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium block w-full"
                  >
                    {authState.loading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right branding block remains the same */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 text-white">
          <div className="max-w-lg text-center">
            <h1 className="text-6xl font-bold mb-6 animate-pulse">SmartHire</h1>
            <p className="text-2xl font-light mb-8 opacity-90">
              The Future of Freelancing
            </p>
            <p className="text-lg mb-12 opacity-80 leading-relaxed">
              Experience the next generation of freelancing with blockchain-powered smart contracts. 
              Build trust, automate payments, and work with confidence in a decentralized ecosystem 
              that puts you in control.
            </p>
              <div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

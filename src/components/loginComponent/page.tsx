'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Github } from 'lucide-react';
import { signIn } from "next-auth/react";


const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
  console.log(isLogin ? "Login" : "Sign Up", formData);
  
};

const handleGoogleAuth = () => {
  console.log("Google Auth");
  signIn("google", { callbackUrl: "/chat" }); 
};

const handleGithubAuth = () => {
  console.log("GitHub Auth");
  signIn("github", { callbackUrl: "/chat" });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-1/6 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/6 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/6 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
              {/* Logo */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  SmartHire
                </h1>
                <p className="text-gray-600 text-sm">Blockchain-Backed Freelance Platform</p>
              </div>

              {/* Tab Buttons */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isLogin
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !isLogin
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Social Login */}
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

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative bg-white px-4 text-sm text-gray-500">or</div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
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
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                        placeholder="Confirm your password"
                        required={!isLogin}
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
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </div>

              {isLogin && (
                <div className="mt-6 text-center">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Forgot your password?
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Brand Info */}
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

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="font-semibold mb-2">Smart Contract Security</h3>
                <p className="text-sm opacity-80">Automated and secure transactions</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold mb-2">Automated Payments</h3>
                <p className="text-sm opacity-80">Milestone-based compensation</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">🌐</div>
                <h3 className="font-semibold mb-2">Decentralized Platform</h3>
                <p className="text-sm opacity-80">Built on Polygon blockchain</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold mb-2">Trustless Collaboration</h3>
                <p className="text-sm opacity-80">No third-party intermediaries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
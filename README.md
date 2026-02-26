# SmartHire - Frontend

## 🚀 Introduction
SmartHire is a decentralized freelance ecosystem designed to bridge the gap between traditional Web2 ease-of-use and Web3 security. This repository contains the frontend implementation, built with a focus on modern UI/UX and seamless blockchain integration.

### ⚠️ The Problem
Traditional freelancing platforms suffer from:
- **Lack of Trust**: Freelancers often face payment delays, while clients fear receiving low-quality or incomplete work.
- **High Middleman Fees**: Centralized platforms take significant commissions (often 10-20%) from every transaction.
- **Opacity**: Contract terms and payment flows are managed behind closed doors, leading to disputes that are hard to resolve.

### ✅ Our Solution
SmartHire solves these challenges through:
- **Blockchain-Backed Escrow**: Utilizing Ethereum Sepolia smart contracts to hold funds securely. Payments are released only when milestones are mutually approved.
- **AI-Assisted Collaboration**: Integrated AI helps users draft precise contracts and clear milestones, reducing ambiguity.
- **Hybrid Web2/Web3 Experience**: Users can sign up using traditional methods (NextAuth) while leveraging non-custodial wallets (MetaMask) for secure payments.
- **Real-Time Interaction**: Features like real-time chat and notifications ensure smooth communication between parties.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Context API
- **Authentication**: NextAuth.js
- **Blockchain**: Ethers.js & MetaMask SDK
- **Icons & UI**: Lucide React & Radix UI

---

## 🚦 Getting Started

Follow these steps to set up the frontend locally:

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the `frontend` directory and add the following:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
MONGODB_URI=your_mongodb_connection_string

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

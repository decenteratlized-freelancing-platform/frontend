"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, User, Shield, CreditCard, Globe, Camera, Save, 
  Upload, Trash2, Phone, MapPin, Link as LinkIcon, X, 
  LogOut, AlertTriangle, Lock, Key, Mail, Bell, Eye, EyeOff,
  CheckCheck, Loader2
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import WalletManagement from "@/components/shared/wallet-management"
import dynamic from "next/dynamic"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-white/5 animate-pulse rounded-lg" />
})

export default function FreelancerSettings() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const [settings, setSettings] = useState({
    fullName: "",
    email: "",
    phone: "",
    professionalBio: "",
    skills: [] as string[],
    portfolioWebsite: "",
    location: "",
    image: "",
    availableForJobs: true,
    // New Fields
    portfolio: [] as any[],
    socialLinks: { github: "", linkedin: "", twitter: "", website: "" },
    verifiedSkills: [] as any[],
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  })

  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "eth",
    timezone: "ist",
    workSchedule: "full-time",
  })

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false })
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null)

  // Skill Verification Modal State
  const [isSkillTestOpen, setIsSkillTestOpen] = useState(false)
  const [currentSkillToVerify, setCurrentSkillToVerify] = useState<string | null>(null)
  const [testScore, setTestScore] = useState(0)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({})
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})

  // Portfolio Modal State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false)
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: "", description: "", url: "" })
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)

  // Confirmation Modals State
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
  const [isDeleting, setIsDeleteing] = useState(false)

  const availableSkills = [
    "React", "Node.js", "TypeScript", "JavaScript", "Python", "Java", "C++", "C#",
    "PHP", "Ruby", "Go", "Swift", "Kotlin", "Dart", "Rust", "HTML/CSS",
    "Vue.js", "Angular", "Next.js", "Express.js", "Django", "Flask", "Laravel",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
    "AWS", "Docker", "Kubernetes", "Git", "CI/CD", "DevOps",
    "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
    "Machine Learning", "Data Science", "Blockchain", "Web3", "Solidity",
    "Mobile Development", "iOS", "Android", "React Native", "Flutter",
    "Content Writing", "Copywriting", "SEO", "Digital Marketing", "Social Media"
  ]

  useEffect(() => {
    // Tick down cooldowns every second
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach(skill => {
          if (next[skill] > Date.now()) {
            changed = true
          } else {
            delete next[skill]
            changed = true
          }
        })
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchFullProfile = async () => {
      const email = session?.user?.email || localStorage.getItem("email");
      if (!email) return;

      try {
        const response = await fetch(`/api/settings?email=${email}`);
        const data = await response.json();

        if (response.ok) {
          const profile = data.profile || {};
          const s = data.settings || {};

          setSettings({
            fullName: profile.fullName || "",
            email: profile.email || email,
            phone: profile.phone || "",
            professionalBio: profile.professionalBio || "",
            skills: Array.isArray(profile.skills) ? profile.skills : [],
            portfolioWebsite: profile.portfolioWebsite || "",
            location: profile.location || "",
            image: profile.image || "",
            availableForJobs: s.availableForJobs !== false,
            portfolio: profile.portfolio || [],
            socialLinks: profile.socialLinks || { github: "", linkedin: "", twitter: "", website: "" },
            verifiedSkills: profile.verifiedSkills || [],
          });

          if (data.settings) {
            setNotifications(data.settings.notifications || notifications);
            setPrivacy(data.settings.privacy || privacy);
            setPreferences(data.settings.preferences || preferences);
          }
        }
      } catch (error) {
        console.error("Error fetching full profile:", error);
      }
    };

    if (status === "authenticated" || localStorage.getItem("email")) {
      fetchFullProfile();
    }
  }, [session, status]);

  useEffect(() => {
    if (settings.skills && settings.skills.length > 0) {
      setSelectedSkills(Array.isArray(settings.skills) ? settings.skills : [])
    }
  }, [settings.skills])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" })
      return
    }

    setUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const email = settings.email || session?.user?.email || localStorage.getItem("email")

        if (!email) {
          toast({ title: "Error", description: "Email not found. Please log in again.", variant: "destructive" })
          setUploadingImage(false)
          return
        }

        try {
          const response = await fetch("/api/user/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: base64String, email }),
          })

          const data = await response.json()
          if (response.ok) {
            localStorage.setItem("userImage", data.image)
            window.dispatchEvent(new Event("userImageUpdated"))
            setSettings(prev => ({ ...prev, image: data.image }))
            toast({ title: "Success", description: "Profile image updated successfully" })
            router.refresh()
          } else {
            throw new Error(data.error || "Failed to upload image")
          }
        } catch (error: any) {
          toast({ title: "Error", description: error.message || "Failed to upload image", variant: "destructive" })
        } finally {
          setUploadingImage(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to process image", variant: "destructive" })
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    const email = settings.email || session?.user?.email || localStorage.getItem("email")
    if (!email) return

    try {
      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null, email }),
      })

      if (response.ok) {
        localStorage.removeItem("userImage")
        window.dispatchEvent(new Event("userImageUpdated"))
        setSettings(prev => ({ ...prev, image: "" }))
        toast({ title: "Success", description: "Profile image removed" })
        router.refresh()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove image", variant: "destructive" })
    }
  }

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "")
    const limitedDigits = digitsOnly.slice(0, 10)
    setSettings(prev => ({ ...prev, phone: limitedDigits }))
    if (limitedDigits.length > 0 && limitedDigits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits")
    } else {
      setPhoneError("")
    }
  }

  const handleLocationChange = (value: string) => {
    setSettings(prev => ({ ...prev, location: value }))
    
    // Clear previous timeout
    if ((window as any).locationSearchTimeout) {
      clearTimeout((window as any).locationSearchTimeout)
    }

    if (value.length > 2) {
      // Set new timeout (debounce 500ms)
      (window as any).locationSearchTimeout = setTimeout(async () => {
        try {
          const response = await fetch(`/api/location/search?query=${encodeURIComponent(value)}`)
          const data = await response.json()
          if (data.predictions) {
            setLocationSuggestions(data.predictions)
            setShowLocationSuggestions(true)
          }
        } catch (error) {
          console.error("Error fetching location suggestions:", error)
        }
      }, 500)
    } else {
      setLocationSuggestions([])
      setShowLocationSuggestions(false)
    }
  }

  const selectLocation = (prediction: any) => {
    setSettings(prev => ({ ...prev, location: prediction.description }))
    if (prediction.lat && prediction.lon) {
      setMapCoordinates({ lat: parseFloat(prediction.lat), lon: parseFloat(prediction.lon) })
    }
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
  }

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPortfolio(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const email = settings.email

        const response = await fetch("/api/user/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: base64String, email }), // Reusing image upload endpoint for demo
        })
        const data = await response.json()
        if (response.ok) {
           setNewPortfolioItem(prev => ({ ...prev, url: data.image }))
           toast({ title: "Image Uploaded", description: "Portfolio image ready." })
        }
      }
      reader.readAsDataURL(file)
    } catch (e) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" })
    } finally {
      setUploadingPortfolio(false)
    }
  }

  const addPortfolioItem = () => {
    if (!newPortfolioItem.title || !newPortfolioItem.url) return
    setSettings(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, { ...newPortfolioItem, uploadedAt: new Date() }]
    }))
    setNewPortfolioItem({ title: "", description: "", url: "" })
    setIsPortfolioModalOpen(false)
  }

  const removePortfolioItem = (index: number) => {
    setSettings(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }))
  }

  const startSkillTest = async (skill: string) => {
    if (cooldowns[skill]) {
      const remaining = Math.ceil((cooldowns[skill] - Date.now()) / 1000)
      toast({ 
        title: "Cooldown Active", 
        description: `Please wait ${remaining}s before retrying ${skill}.`, 
        variant: "destructive" 
      })
      return
    }

    setCurrentSkillToVerify(skill)
    setGeneratingQuiz(true)
    setIsSkillTestOpen(true)
    setTestSubmitted(false)
    setTestAnswers({})
    setQuizQuestions([])

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill })
      })
      const data = await res.json()
      if (data.questions) {
        setQuizQuestions(data.questions)
      } else {
        throw new Error("Failed to generate questions")
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not generate AI quiz. Try again later.", variant: "destructive" })
      setIsSkillTestOpen(false)
    } finally {
      setGeneratingQuiz(false)
    }
  }

  const submitSkillTest = () => {
    if (quizQuestions.length === 0) return

    let correctCount = 0
    quizQuestions.forEach((q, idx) => {
      if (testAnswers[idx] === q.correctAnswer) {
        correctCount++
      }
    })

    const score = (correctCount / quizQuestions.length) * 100
    setTestScore(score)
    setTestSubmitted(true)

    if (score >= 80 && currentSkillToVerify) {
      setSettings(prev => ({
        ...prev,
        verifiedSkills: [...prev.verifiedSkills, { skill: currentSkillToVerify, score, verifiedAt: new Date() }]
      }))
      toast({ title: "Congratulations!", description: `You passed the ${currentSkillToVerify} skill test with ${score}%!` })
      // Auto-save the verification
      setTimeout(() => handleSaveProfile(), 1000)
    } else {
      toast({ title: "Test Failed", description: `You scored ${score}%. 80% is required. 5 min cooldown active.`, variant: "destructive" })
      if (currentSkillToVerify) {
        setCooldowns(prev => ({ ...prev, [currentSkillToVerify]: Date.now() + 5 * 60 * 1000 }))
      }
    }
    
    setTimeout(() => setIsSkillTestOpen(false), 3000)
  }

  const handleSaveProfile = async () => {
    const email = settings.email || session?.user?.email || localStorage.getItem("email")
    if (!email) {
      toast({ title: "Error", description: "Email not found. Please log in again.", variant: "destructive" })
      return
    }

    // 1. Validation
    if (!settings.fullName || settings.fullName.trim().split(" ").length < 2) {
      toast({ title: "Validation Error", description: "Please provide your full name (First and Last name).", variant: "destructive" })
      return
    }

    if (settings.phone && settings.phone.length !== 10) {
      toast({ title: "Validation Error", description: "Phone number must be exactly 10 digits", variant: "destructive" })
      return
    }

    if (!settings.professionalBio || settings.professionalBio.trim().length < 50) {
      toast({ title: "Validation Error", description: "Please provide a professional bio (min 50 characters) to help clients know you better.", variant: "destructive" })
      return
    }

    if (selectedSkills.length < 3) {
      toast({ title: "Validation Error", description: "Please select at least 3 skills to showcase your expertise.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const body = {
        email,
        fullName: settings.fullName,
        phone: settings.phone,
        bio: settings.professionalBio,
        skills: selectedSkills.length > 0 ? selectedSkills.join(",") : settings.skills.join(","),
        notifications,
        privacy,
        availableForJobs: settings.availableForJobs,
        preferences: {
            ...preferences,
        },
        portfolioWebsite: settings.portfolioWebsite,
        location: settings.location,
        image: settings.image,
        portfolio: settings.portfolio,
        socialLinks: settings.socialLinks,
        verifiedSkills: settings.verifiedSkills
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update profile")

      // Update localStorage for persistence
      if (typeof window !== "undefined") {
          localStorage.setItem("fullName", settings.fullName);
          localStorage.setItem("email", email);
          
          // Dispatch event for sidebar to update immediately
          window.dispatchEvent(new CustomEvent("userProfileUpdated", {
              detail: {
                  fullName: settings.fullName,
                  email: settings.email,
                  image: settings.image
              }
          }));
      }

      toast({ title: "Success", description: "Profile updated successfully", variant: "default" })
      router.refresh()
    } catch (err: any) {
      console.error("Profile save error:", err)
      toast({ title: "Error", description: err.message || "Failed to update profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords don't match", variant: "destructive" })
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast({ title: "Auth required", description: "Please log in before changing password.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update password")

      toast({ title: "Success", description: "Password updated successfully.", variant: "default" })
      localStorage.removeItem("token")
      setPasswords({ current: "", new: "", confirm: "" })
      router.refresh()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update password", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  const handleDeleteAccount = async () => {
    const email = settings.email || session?.user?.email || localStorage.getItem("email");
    if (!email) return;

    setIsDeleteing(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (res.ok) {
            handleLogout();
        } else {
            toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
        }
    } catch (e) {
        toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
    } finally {
        setIsDeleteing(false);
        setIsDeleteAccountDialogOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Freelancer Settings</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gray-400 to-slate-500 bg-clip-text text-transparent">Profile Settings</span>
        </h1>
        <p className="text-xl text-gray-300">Manage your public profile and preferences</p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-white hover:bg-white/10"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-white hover:bg-white/10"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-white hover:bg-white/10"><CreditCard className="w-4 h-4 mr-2" />Payment</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-white hover:bg-white/10"><Settings className="w-4 h-4 mr-2" />Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-white">Profile Information</CardTitle>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</span>
                      <span className={`text-xs font-bold ${settings.availableForJobs ? "text-emerald-400" : "text-orange-400"}`}>
                        {settings.availableForJobs ? "Available" : "Busy"}
                      </span>
                    </div>
                    <Switch 
                      checked={settings.availableForJobs} 
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, availableForJobs: v }))} 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <UserAvatar user={settings} className="w-24 h-24 border-2 border-white/20 bg-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-400 mb-3">Upload a professional photo for your profile</p>
                    <div className="flex gap-2">
                      <label htmlFor="image-upload" className="flex-1">
                        <Button variant="outline" className="w-full bg-white border-white/10 text-black hover:bg-gray-200 cursor-pointer" disabled={uploadingImage} asChild>
                          <span><Upload className="w-4 h-4 mr-2" />{uploadingImage ? "Uploading..." : "Upload"}</span>
                        </Button>
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <Button variant="outline" className="bg-white border-white/10 text-black hover:bg-gray-200" onClick={handleRemoveImage}>
                        <Trash2 className="w-4 h-4 mr-2" />Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">First Name</Label>
                    <Input value={settings.fullName?.split(" ")[0] || ""} onChange={e => setSettings(prev => ({ ...prev, fullName: `${e.target.value} ${prev.fullName?.split(" ").slice(1).join(" ") || ""}` }))} className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">Last Name</Label>
                    <Input value={settings.fullName?.split(" ").slice(1).join(" ") || ""} onChange={e => setSettings(prev => ({ ...prev, fullName: `${prev.fullName?.split(" ")[0] || ""} ${e.target.value}` }))} className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">Email</Label>
                    <Input value={settings.email} disabled className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">Phone (10 digits)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="tel" value={settings.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="1234567890" maxLength={10} className={`bg-white/5 border-white/10 text-white pl-10 ${phoneError ? "border-red-500" : ""}`} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input value={settings.location} onChange={e => handleLocationChange(e.target.value)} onFocus={() => settings.location.length > 2 && setShowLocationSuggestions(true)} placeholder="Enter your location" className="bg-white/5 border-white/10 text-white pl-10" />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {locationSuggestions.map((prediction) => (
                          <div key={prediction.place_id} className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200" onClick={() => selectLocation(prediction)}>
                            {prediction.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {(mapCoordinates || settings.location) && (
                    <div className="mt-2 h-[250px] w-full relative z-0">
                      {mapCoordinates ? (
                        <LeafletMap lat={mapCoordinates.lat} lon={mapCoordinates.lon} zoom={13} popupText={settings.location} />
                      ) : (
                        <div className="h-full w-full bg-white/5 rounded-lg flex items-center justify-center text-gray-400 border border-white/10">Search and select a location to view map</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Social Links Section */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label className="text-gray-300">GitHub</Label>
                        <Input 
                            value={settings.socialLinks.github} 
                            onChange={e => setSettings(p => ({ ...p, socialLinks: { ...p.socialLinks, github: e.target.value } }))}
                            className="bg-white/5 border-white/10 text-white" 
                            placeholder="github.com/username"
                        />
                     </div>
                     <div>
                        <Label className="text-gray-300">LinkedIn</Label>
                        <Input 
                            value={settings.socialLinks.linkedin} 
                            onChange={e => setSettings(p => ({ ...p, socialLinks: { ...p.socialLinks, linkedin: e.target.value } }))}
                            className="bg-white/5 border-white/10 text-white" 
                            placeholder="linkedin.com/in/username"
                        />
                     </div>
                     <div>
                        <Label className="text-gray-300">Twitter (X)</Label>
                        <Input 
                            value={settings.socialLinks.twitter} 
                            onChange={e => setSettings(p => ({ ...p, socialLinks: { ...p.socialLinks, twitter: e.target.value } }))}
                            className="bg-white/5 border-white/10 text-white" 
                            placeholder="@username"
                        />
                     </div>
                     <div>
                        <Label className="text-gray-300">Personal Website</Label>
                        <Input 
                            value={settings.socialLinks.website} 
                            onChange={e => setSettings(p => ({ ...p, socialLinks: { ...p.socialLinks, website: e.target.value } }))}
                            className="bg-white/5 border-white/10 text-white" 
                            placeholder="https://mysite.com"
                        />
                     </div>
                  </div>
                </div>

                {/* Portfolio Section */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Portfolio Gallery</h3>
                    <Button variant="outline" onClick={() => setIsPortfolioModalOpen(true)} className="border-white/20 text-white hover:bg-white/10">
                        + Add Project
                    </Button>
                  </div>
                  
                  {isPortfolioModalOpen && (
                    <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl space-y-3 mb-4">
                        <Input 
                            placeholder="Project Title" 
                            value={newPortfolioItem.title}
                            onChange={e => setNewPortfolioItem(p => ({ ...p, title: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Textarea 
                            placeholder="Description"
                            value={newPortfolioItem.description}
                            onChange={e => setNewPortfolioItem(p => ({ ...p, description: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <div className="flex gap-2">
                            <Input type="file" onChange={handlePortfolioImageUpload} className="bg-zinc-800 text-white" />
                            <Button onClick={addPortfolioItem} disabled={uploadingPortfolio}>
                                {uploadingPortfolio ? "Uploading..." : "Add"}
                            </Button>
                        </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {settings.portfolio.map((item, idx) => (
                        <div key={idx} className="relative group bg-zinc-900 rounded-xl overflow-hidden border border-white/10">
                            <div className="relative w-full h-32">
                                <Image src={item.url} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-white">{item.title}</h4>
                                <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            </div>
                            <button 
                                onClick={() => removePortfolioItem(idx)}
                                className="absolute top-2 right-2 bg-red-500/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ))}
                    {settings.portfolio.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            No projects added yet.
                        </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">Professional Bio</Label>
                  <Textarea value={settings.professionalBio} onChange={e => setSettings(prev => ({ ...prev, professionalBio: e.target.value }))} className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">Skills & Expertise</Label>
                  <div className="relative">
                    <Input value={skillInput} onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }} onFocus={() => setShowSkillSuggestions(true)} placeholder="Type a skill (e.g. React, Python)..." className="bg-white/5 border-white/10 text-white" />
                    {showSkillSuggestions && skillInput && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {availableSkills
                          .filter((skill) => !selectedSkills.includes(skill) && skill.toLowerCase().includes(skillInput.toLowerCase()))
                          .map((skill) => (
                            <div key={skill} className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200" onClick={() => {
                              const newSkills = [...selectedSkills, skill];
                              setSelectedSkills(newSkills);
                              setSettings(prev => ({ ...prev, skills: newSkills }));
                              setSkillInput("");
                              setShowSkillSuggestions(false);
                            }}>
                              {skill}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedSkills.map((skill, index) => {
                      const isVerified = settings.verifiedSkills?.some(v => v.skill === skill)
                      return (
                      <Badge key={index} variant="secondary" className={`bg-white/10 text-white cursor-pointer hover:bg-white/20 flex items-center gap-1 ${isVerified ? "border-emerald-500/50 border" : ""}`}>
                        {skill} 
                        {isVerified && <Shield className="w-3 h-3 text-emerald-400" />}
                        {!isVerified && (
                            <span 
                                onClick={(e) => { e.stopPropagation(); startSkillTest(skill); }}
                                className="text-[10px] ml-1 bg-blue-600 px-1 rounded hover:bg-blue-500"
                            >
                                Verify
                            </span>
                        )}
                        <X className="w-3 h-3 ml-1" onClick={() => {
                          const newSkills = selectedSkills.filter((_, i) => i !== index);
                          setSelectedSkills(newSkills);
                          setSettings(prev => ({ ...prev, skills: newSkills }));
                        }} />
                      </Badge>
                    )})}
                  </div>
                </div>
                
                {/* Skill Test Modal (AI powered) */}
                {isSkillTestOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-xl bg-zinc-900 border-zinc-800 shadow-2xl">
                            <CardHeader className="border-b border-zinc-800 pb-4">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-500" />
                                        <span>AI Verification: {currentSkillToVerify}</span>
                                    </div>
                                    {!testSubmitted && !generatingQuiz && (
                                        <Badge variant="outline" className="text-zinc-400">80% Passing Score</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {generatingQuiz ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                        <div className="text-center">
                                            <p className="text-white font-medium">Generating Custom AI Quiz...</p>
                                            <p className="text-zinc-500 text-sm mt-1">Analyzing depth for {currentSkillToVerify}</p>
                                        </div>
                                    </div>
                                ) : !testSubmitted ? (
                                    <div className="space-y-6">
                                        <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                            {quizQuestions.map((q, qIdx) => (
                                                <div key={qIdx} className="space-y-3 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                                    <p className="text-white text-sm font-medium flex gap-3">
                                                        <span className="text-zinc-500">0{qIdx + 1}.</span>
                                                        {q.question}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                        {q.options.map((option: string, oIdx: number) => (
                                                            <button
                                                                key={oIdx}
                                                                onClick={() => setTestAnswers(prev => ({ ...prev, [qIdx]: option }))}
                                                                className={`text-left p-3 rounded-lg text-xs transition-all border ${
                                                                    testAnswers[qIdx] === option
                                                                        ? "bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50"
                                                                }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                                            <Button variant="ghost" onClick={() => setIsSkillTestOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                                            <Button 
                                                onClick={submitSkillTest} 
                                                disabled={Object.keys(testAnswers).length < quizQuestions.length}
                                                className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-8"
                                            >
                                                Complete Verification
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                            {quizQuestions.map((q, qIdx) => (
                                                <div key={qIdx} className="space-y-3 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                                    <p className="text-white text-sm font-medium flex gap-3">
                                                        <span className="text-zinc-500">0{qIdx + 1}.</span>
                                                        {q.question}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                        {q.options.map((option: string, oIdx: number) => {
                                                            const isUserChoice = testAnswers[qIdx] === option;
                                                            const isCorrect = q.correctAnswer === option;
                                                            
                                                            let variantClass = "bg-zinc-900 border-zinc-800 text-zinc-500";
                                                            if (isCorrect) variantClass = "bg-emerald-500/20 border-emerald-500 text-emerald-200";
                                                            else if (isUserChoice && !isCorrect) variantClass = "bg-red-500/20 border-red-500 text-red-200";

                                                            return (
                                                                <div
                                                                    key={oIdx}
                                                                    className={`text-left p-3 rounded-lg text-xs border ${variantClass}`}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span>{option}</span>
                                                                        {isCorrect && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                                                                        {isUserChoice && !isCorrect && <X className="w-3 h-3 text-red-500" />}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-center py-6 border-t border-zinc-800 space-y-4">
                                            <h3 className={`text-2xl font-bold ${testScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {testScore >= 80 ? "Verification Successful!" : "Verification Failed"}
                                            </h3>
                                            <p className="text-zinc-400 mt-2">Final Score: <span className="text-white font-bold">{testScore}%</span></p>
                                            <Button onClick={() => setIsSkillTestOpen(false)} className="bg-white text-black font-bold">Close Results</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Button onClick={handleSaveProfile} disabled={loading} className="bg-white hover:bg-gray-200 text-black w-full py-6 rounded-xl font-bold">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving Changes..." : "Save Profile Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Password & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-300 mb-2 block">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} type={showPasswords.current ? "text" : "password"} className="bg-white/5 border-white/10 text-white pl-10" />
                        <button onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-3 text-zinc-500">{showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-300 mb-2 block">New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} type={showPasswords.new ? "text" : "password"} className="bg-white/5 border-white/10 text-white pl-10" />
                        <button onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-3 text-zinc-500">{showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-300 mb-2 block">Confirm New Password</Label>
                      <Input value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} type="password" className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>
                  <Button onClick={handlePasswordUpdate} disabled={loading} className="bg-white hover:bg-gray-200 text-black w-full py-6 rounded-xl font-bold">Update Security Credentials</Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader><CardTitle className="text-xl font-bold text-white">Privacy Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Public Visibility</h3>
                      <p className="text-sm text-gray-400">Make your profile discoverable to all clients</p>
                    </div>
                    <Switch checked={privacy.profileVisible} onCheckedChange={(v) => setPrivacy(prev => ({ ...prev, profileVisible: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Allow Direct Messaging</h3>
                      <p className="text-sm text-gray-400">Let clients message you before a contract starts</p>
                    </div>
                    <Switch checked={privacy.allowMessages} onCheckedChange={(v) => setPrivacy(prev => ({ ...prev, allowMessages: v }))} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <WalletManagement />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader><CardTitle className="text-gray-100">Account Management</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                        <h3 className="text-lg font-medium text-white">Sign Out</h3>
                        <p className="text-sm text-gray-400">Securely end your current session</p>
                    </div>
                    <Button onClick={() => setIsLogoutDialogOpen(true)} variant="outline" className="border-white/10 text-gray-200 hover:bg-white/10"><LogOut className="w-4 h-4 mr-2" />Log Out</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                        <h3 className="text-lg font-medium text-red-400">Delete Account</h3>
                        <p className="text-sm text-red-300/70">Permanently erase your account and data. This is irreversible.</p>
                    </div>
                    <Button onClick={() => setIsDeleteAccountDialogOpen(true)} variant="destructive" className="bg-red-500 hover:bg-red-600"><AlertTriangle className="w-4 h-4 mr-2" />Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsLogoutDialogOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">Cancel</Button>
            <Button onClick={handleLogout} className="bg-white text-black hover:bg-zinc-200">Sign Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This action is irreversible. All your profile data, history, and active contracts will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteAccountDialogOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900" disabled={isDeleting}>Cancel</Button>
            <Button 
              onClick={handleDeleteAccount} 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
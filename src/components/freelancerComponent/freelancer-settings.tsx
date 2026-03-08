"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
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
  CheckCheck, Loader2, Search, Command
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
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
  const languageInputRef = useRef<HTMLInputElement>(null)

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
    languages: [] as string[],
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
  const [languageInput, setLanguageInput] = useState("")
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false)
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1)
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

  const popularLanguages = [
    "English", "Spanish", "French", "German", "Mandarin", "Hindi", "Gujarati", "Arabic", 
    "Bengali", "Portuguese", "Russian", "Japanese", "Korean", "Italian",
    "Turkish", "Vietnamese", "Telugu", "Marathi", "Tamil", "Urdu", 
    "Greek", "Dutch", "Polish", "Thai", "Swedish", "Indonesian"
  ].sort()

  const filteredLanguages = languageInput 
    ? popularLanguages.filter(l => 
        l.toLowerCase().includes(languageInput.toLowerCase()) && 
        !settings.languages.includes(l)
      ).sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(languageInput.toLowerCase())
        const bStarts = b.toLowerCase().startsWith(languageInput.toLowerCase())
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return a.localeCompare(b)
      })
    : []

  useEffect(() => {
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
            languages: profile.languages || ["English"],
            portfolio: profile.portfolio || [],
            socialLinks: profile.socialLinks || { github: "", linkedin: "", twitter: "", website: "" },
            verifiedSkills: profile.verifiedSkills || [],
          });

          if (data.settings) {
            setNotifications(prev => data.settings.notifications || prev);
            setPrivacy(prev => data.settings.privacy || prev);
            setPreferences(prev => data.settings.preferences || prev);
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
    if ((window as any).locationSearchTimeout) {
      clearTimeout((window as any).locationSearchTimeout)
    }
    if (value.length > 2) {
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

  const addLanguage = (lang: string) => {
    const trimmed = lang.trim()
    if (trimmed && !settings.languages.includes(trimmed)) {
      setSettings(prev => ({ ...prev, languages: [...prev.languages, trimmed] }))
      setLanguageInput("")
      setShowLanguageSuggestions(false)
      setFocusedSuggestionIndex(-1)
    }
  }

  const removeLanguage = (lang: string) => {
    setSettings(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))
  }

  const handleLanguageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedSuggestionIndex(prev => Math.min(prev + 1, filteredLanguages.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedSuggestionIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedSuggestionIndex >= 0 && filteredLanguages[focusedSuggestionIndex]) {
        addLanguage(filteredLanguages[focusedSuggestionIndex])
      } else if (languageInput) {
        addLanguage(languageInput)
      }
    } else if (e.key === 'Escape') {
      setShowLanguageSuggestions(false)
    }
  }

  const startSkillTest = async (skill: string) => {
    if (cooldowns[skill]) {
      const remaining = Math.ceil((cooldowns[skill] - Date.now()) / 1000)
      toast({ title: "Cooldown Active", description: `Please wait ${remaining}s before retrying ${skill}.`, variant: "destructive" })
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
      if (data.questions) setQuizQuestions(data.questions)
      else throw new Error("Failed to generate questions")
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
    quizQuestions.forEach((q, idx) => { if (testAnswers[idx] === q.correctAnswer) correctCount++ })
    const score = (correctCount / quizQuestions.length) * 100
    setTestScore(score)
    setTestSubmitted(true)
    if (score >= 80 && currentSkillToVerify) {
      setSettings(prev => ({
        ...prev,
        verifiedSkills: [...prev.verifiedSkills, { skill: currentSkillToVerify, score, verifiedAt: new Date() }]
      }))
      toast({ title: "Congratulations!", description: `You passed the ${currentSkillToVerify} skill test with ${score}%!` })
      setTimeout(() => handleSaveProfile(), 1000)
    } else {
      toast({ title: "Test Failed", description: `You scored ${score}%. 80% is required. 5 min cooldown active.`, variant: "destructive" })
      if (currentSkillToVerify) setCooldowns(prev => ({ ...prev, [currentSkillToVerify]: Date.now() + 5 * 60 * 1000 }))
    }
    setTimeout(() => setIsSkillTestOpen(false), 3000)
  }

  const handleSaveProfile = async () => {
    const email = settings.email || session?.user?.email || localStorage.getItem("email")
    if (!email) { toast({ title: "Error", description: "Email not found.", variant: "destructive" }); return; }
    if (!settings.fullName || settings.fullName.trim().split(" ").length < 2) {
      toast({ title: "Validation Error", description: "Please provide your full name.", variant: "destructive" }); return;
    }
    if (settings.phone && settings.phone.length !== 10) {
      toast({ title: "Validation Error", description: "Phone must be 10 digits.", variant: "destructive" }); return;
    }
    if (!settings.professionalBio || settings.professionalBio.trim().length < 50) {
      toast({ title: "Validation Error", description: "Bio must be min 50 characters.", variant: "destructive" }); return;
    }
    if (selectedSkills.length < 3) {
      toast({ title: "Validation Error", description: "Select at least 3 skills.", variant: "destructive" }); return;
    }

    setLoading(true)
    try {
      const body = {
        email, fullName: settings.fullName, phone: settings.phone,
        bio: settings.professionalBio, skills: selectedSkills.join(","),
        notifications, privacy, availableForJobs: settings.availableForJobs,
        preferences, portfolioWebsite: settings.portfolioWebsite,
        location: settings.location, image: settings.image,
        portfolio: settings.portfolio, socialLinks: settings.socialLinks,
        verifiedSkills: settings.verifiedSkills, languages: settings.languages
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error("Failed to update profile")
      toast({ title: "Success", description: "Profile updated successfully" })
      router.refresh()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) { toast({ title: "Error", description: "Passwords don't match", variant: "destructive" }); return; }
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      })
      if (!response.ok) throw new Error("Failed to update password")
      toast({ title: "Success", description: "Password updated." })
      setPasswords({ current: "", new: "", confirm: "" })
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => { localStorage.clear(); await signOut({ callbackUrl: "/login" }); };

  const handleDeleteAccount = async () => {
    setIsDeleteing(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/delete`, {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: settings.email })
        });
        if (res.ok) handleLogout();
        else toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
    } catch (e) { toast({ title: "Error", description: "Failed to delete account", variant: "destructive" }); }
    finally { setIsDeleteing(false); setIsDeleteAccountDialogOpen(false); }
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
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-visible">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight">Expert Profile</CardTitle>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Availability</span>
                      <span className={`text-xs font-bold ${settings.availableForJobs ? "text-emerald-400" : "text-orange-400"}`}>
                        {settings.availableForJobs ? "Active" : "Away"}
                      </span>
                    </div>
                    <Switch checked={settings.availableForJobs} onCheckedChange={(v) => setSettings(prev => ({ ...prev, availableForJobs: v }))} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <UserAvatar user={settings} className="w-24 h-24 border-2 border-white/20 bg-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-400 mb-3">Professional photos increase client trust.</p>
                    <div className="flex gap-2">
                      <label htmlFor="image-upload" className="flex-1">
                        <Button variant="outline" className="w-full bg-white border-white/10 text-black hover:bg-gray-200 cursor-pointer" disabled={uploadingImage} asChild>
                          <span><Upload className="w-4 h-4 mr-2" />{uploadingImage ? "Uploading..." : "Upload New"}</span>
                        </Button>
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <Button variant="outline" className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-red-500/10" onClick={handleRemoveImage}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">First Name</Label>
                    <Input value={settings.fullName?.split(" ")[0] || ""} onChange={e => setSettings(prev => ({ ...prev, fullName: `${e.target.value} ${prev.fullName?.split(" ").slice(1).join(" ") || ""}` }))} className="bg-zinc-950 border-white/10 text-white focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Last Name</Label>
                    <Input value={settings.fullName?.split(" ").slice(1).join(" ") || ""} onChange={e => setSettings(prev => ({ ...prev, fullName: `${prev.fullName?.split(" ")[0] || ""} ${e.target.value}` }))} className="bg-zinc-950 border-white/10 text-white focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Account Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                        <Input value={settings.email} disabled className="bg-zinc-950 border-white/5 text-gray-500 cursor-not-allowed pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                      <Input type="tel" value={settings.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile" maxLength={10} className={`bg-zinc-950 border-white/10 text-white pl-10 ${phoneError ? "border-red-500" : "focus:ring-blue-500/50"}`} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Languages & Communication</Label>
                  <p className="text-[11px] text-zinc-500 mb-4 leading-tight">Add the languages you are comfortable communicating in with clients.</p>
                  
                  <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                            <Input 
                                ref={languageInputRef}
                                value={languageInput} 
                                onChange={(e) => {
                                    setLanguageInput(e.target.value);
                                    setShowLanguageSuggestions(true);
                                    setFocusedSuggestionIndex(-1);
                                }} 
                                onFocus={() => setShowLanguageSuggestions(true)}
                                placeholder="Search languages (e.g. English, French)..." 
                                className="bg-zinc-950 border-white/10 text-white pl-11 py-6 focus:border-blue-500/50 transition-all rounded-xl"
                                onKeyDown={handleLanguageKeyDown}
                            />
                            <div className="absolute right-4 top-4 hidden sm:flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-tighter">
                                <Command size={10} /> + Enter
                            </div>
                        </div>
                    </div>
                    
                    <AnimatePresence>
                        {showLanguageSuggestions && filteredLanguages.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-[100] w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-60 overflow-hidden flex flex-col p-2"
                            >
                                <div className="text-[10px] font-bold text-zinc-500 px-3 py-2 uppercase tracking-widest border-b border-white/5 mb-1 flex justify-between">
                                    <span>Suggestions</span>
                                    <span>{filteredLanguages.length} Found</span>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar flex-1">
                                    {filteredLanguages.map((lang, idx) => (
                                        <div 
                                            key={lang} 
                                            className={`group px-4 py-3 cursor-pointer text-sm rounded-xl flex items-center justify-between transition-all ${
                                                focusedSuggestionIndex === idx 
                                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" 
                                                : "text-zinc-300 hover:bg-white/5 border border-transparent"
                                            }`}
                                            onClick={() => addLanguage(lang)}
                                            onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Globe size={14} className={focusedSuggestionIndex === idx ? "text-blue-400" : "text-zinc-600"} />
                                                <span className="font-medium">{lang}</span>
                                            </div>
                                            {focusedSuggestionIndex === idx && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Enter</span>}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-6">
                    {settings.languages.map((lang) => (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={lang}>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-2 px-4 flex items-center gap-3 rounded-xl group transition-all hover:bg-blue-500/20">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="font-bold text-xs">{lang}</span>
                            <X className="w-3.5 h-3.5 cursor-pointer text-zinc-600 hover:text-white transition-colors ml-1" onClick={() => removeLanguage(lang)} />
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Professional Biography</Label>
                  <Textarea value={settings.professionalBio} onChange={e => setSettings(prev => ({ ...prev, professionalBio: e.target.value }))} className="bg-zinc-950 border-white/10 text-white min-h-[150px] leading-relaxed py-4 focus:border-blue-500/50" placeholder="Describe your expertise..." />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 block">Skills & Expertise</Label>
                  <div className="relative">
                    <Input value={skillInput} onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }} onFocus={() => setShowSkillSuggestions(true)} placeholder="Add expertise..." className="bg-zinc-950 border-white/10 text-white py-6" />
                    {showSkillSuggestions && skillInput && (
                      <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-60 overflow-auto p-2">
                        {availableSkills
                          .filter((skill) => !selectedSkills.includes(skill) && skill.toLowerCase().includes(skillInput.toLowerCase()))
                          .map((skill) => (
                            <div key={skill} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-zinc-300 rounded-xl" onClick={() => {
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
                  <div className="flex flex-wrap gap-2 mt-6">
                    {selectedSkills.map((skill, index) => {
                      const isVerified = settings.verifiedSkills?.some(v => v.skill === skill)
                      return (
                      <Badge key={index} variant="secondary" className={`bg-zinc-900 text-white border border-white/5 py-2 px-4 flex items-center gap-2 rounded-xl transition-all hover:border-white/20 ${isVerified ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : ""}`}>
                        {skill} 
                        {isVerified && <Shield className="w-3 h-3 text-emerald-400" />}
                        {!isVerified && (
                            <button onClick={(e) => { e.stopPropagation(); startSkillTest(skill); }} className="text-[10px] ml-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg hover:bg-blue-600 transition-all font-bold">
                                Verify
                            </button>
                        )}
                        <X className="w-3.5 h-3.5 ml-1 cursor-pointer text-zinc-600 hover:text-white" onClick={() => {
                          const newSkills = selectedSkills.filter((_, i) => i !== index);
                          setSelectedSkills(newSkills);
                          setSettings(prev => ({ ...prev, skills: newSkills }));
                        }} />
                      </Badge>
                    )})}
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading} className="bg-white hover:bg-zinc-200 text-zinc-950 w-full py-8 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-[0.98]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Commit Profile Updates</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader><CardTitle className="text-2xl font-bold text-white tracking-tight">Security Vault</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                      <Input value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} type={showPasswords.current ? "text" : "password"} className="bg-zinc-950 border-white/10 text-white pl-10 h-12" />
                      <button onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-3 text-zinc-500 hover:text-white">{showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">New Secure Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                      <Input value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} type={showPasswords.new ? "text" : "password"} className="bg-zinc-950 border-white/10 text-white pl-10 h-12" />
                      <button onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-3 text-zinc-500 hover:text-white">{showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <Button onClick={handlePasswordUpdate} disabled={loading} className="bg-zinc-800 hover:bg-zinc-700 text-white w-full py-6 rounded-xl font-bold border border-white/5">Rotate Access Keys</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing"><WalletManagement /></TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader><CardTitle className="text-gray-100 tracking-tight">Session Control</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-zinc-950/50 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">Terminate Session</h3>
                        <p className="text-xs text-gray-500 mt-1">Log out of this device and clear local caches.</p>
                    </div>
                    <Button onClick={() => setIsLogoutDialogOpen(true)} variant="outline" className="border-white/10 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl font-bold px-6">Sign Out</Button>
                </div>
                <div className="flex items-center justify-between p-6 bg-red-500/5 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-all">
                    <div>
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-tight">Erase Identity</h3>
                        <p className="text-xs text-red-300/50 mt-1 leading-relaxed">Permanently delete your account. Irreversible.</p>
                    </div>
                    <Button onClick={() => setIsDeleteAccountDialogOpen(true)} variant="destructive" className="bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-widest rounded-xl px-6 py-6 h-auto">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Sign Out?</DialogTitle></DialogHeader>
          <DialogFooter className="gap-3 sm:justify-end mt-6">
            <Button variant="ghost" onClick={() => setIsLogoutDialogOpen(false)} className="text-zinc-500 hover:text-white rounded-xl h-12 px-6">Cancel</Button>
            <Button onClick={handleLogout} className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-12 px-8">Confirm Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl">
          <DialogHeader><DialogTitle className="text-2xl font-black text-red-500 uppercase tracking-tighter">Critical Action</DialogTitle></DialogHeader>
          <DialogFooter className="gap-3 sm:justify-end mt-8">
            <Button variant="ghost" onClick={() => setIsDeleteAccountDialogOpen(false)} className="text-zinc-400 hover:text-white rounded-xl h-12 px-6" disabled={isDeleting}>Cancel</Button>
            <Button onClick={handleDeleteAccount} variant="destructive" className="bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest rounded-xl h-12 px-8" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Delete Identity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

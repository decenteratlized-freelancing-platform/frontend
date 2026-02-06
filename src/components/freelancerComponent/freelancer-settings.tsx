"use client"

import { useState, useEffect } from "react"
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
  LogOut, AlertTriangle, Lock, Key, Mail, Bell, Eye, EyeOff
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import WalletManagement from "@/components/shared/wallet-management"
import dynamic from "next/dynamic"
import { Label } from "@/components/ui/label"

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-white/5 animate-pulse rounded-lg" />
})

export default function FreelancerSettings() {
  const { data: session } = useSession()
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
    hourlyRate: 0,
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
    if (typeof window === "undefined") return

    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("currentUser") || "null")
      } catch {
        return null
      }
    })()

    const initialEmail = stored?.email || session?.user?.email || localStorage.getItem("email") || ""
    const initialFullName = stored?.fullName || (session?.user?.name as string) || localStorage.getItem("fullName") || ""

    setSettings(prev => ({
      ...prev,
      email: initialEmail,
      fullName: initialFullName,
      phone: stored?.settings?.phone || stored?.phone || prev.phone,
      professionalBio: stored?.settings?.bio || stored?.professionalBio || prev.professionalBio,
      portfolioWebsite: stored?.settings?.portfolioWebsite || stored?.portfolioWebsite || prev.portfolioWebsite,
      location: stored?.settings?.location || stored?.location || prev.location,
      image: stored?.image || prev.image,
      hourlyRate: stored?.settings?.hourlyRate || prev.hourlyRate,
      skills: Array.isArray(stored?.settings?.skills) ? stored.settings.skills : (stored?.settings?.skills ? stored.settings.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : prev.skills),
    }))
  }, [session])

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

  const handleLocationChange = async (value: string) => {
    setSettings(prev => ({ ...prev, location: value }))
    if (value.length > 2) {
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

  const handleSaveProfile = async () => {
    const email = settings.email || session?.user?.email || localStorage.getItem("email")
    if (!email) {
      toast({ title: "Error", description: "Email not found. Please log in again.", variant: "destructive" })
      return
    }

    if (settings.phone && settings.phone.length !== 10) {
      toast({ title: "Validation Error", description: "Phone number must be exactly 10 digits", variant: "destructive" })
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
        preferences: {
            ...preferences,
            hourlyRate: settings.hourlyRate
        },
        portfolioWebsite: settings.portfolioWebsite,
        location: settings.location,
        image: settings.image,
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
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    const email = settings.email || session?.user?.email || localStorage.getItem("email");
    if (!email) return;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (res.ok) handleLogout();
        else toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
    } catch (e) {
        toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
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
                <CardTitle className="text-2xl font-bold text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <UserAvatar user={settings} className="w-24 h-24 border-2 border-white/20 bg-gray-700" />
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Camera className="w-4 h-4" />
                    </Button>
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

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">Portfolio Website</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="url" value={settings.portfolioWebsite} onChange={e => setSettings(prev => ({ ...prev, portfolioWebsite: e.target.value }))} placeholder="https://yourportfolio.com" className="bg-white/5 border-white/10 text-white pl-10" />
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
                    {selectedSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/10 text-white cursor-pointer hover:bg-white/20 flex items-center gap-1" onClick={() => {
                        const newSkills = selectedSkills.filter((_, i) => i !== index);
                        setSelectedSkills(newSkills);
                        setSettings(prev => ({ ...prev, skills: newSkills }));
                      }}>
                        {skill} <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">Hourly Rate (ETH)</Label>
                    <div className="relative max-w-[200px]">
                        <span className="absolute left-3 top-3 text-zinc-500 font-bold">Ξ</span>
                        <Input 
                            type="number" 
                            min="0"
                            value={settings.hourlyRate} 
                            onChange={e => setSettings(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))} 
                            className="bg-white/5 border-white/10 text-white pl-8" 
                        />
                    </div>
                </div>

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
                    <Button onClick={handleLogout} variant="outline" className="border-white/10 text-gray-200 hover:bg-white/10"><LogOut className="w-4 h-4 mr-2" />Log Out</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                        <h3 className="text-lg font-medium text-red-400">Delete Account</h3>
                        <p className="text-sm text-red-300/70">Permanently erase your account and data. This is irreversible.</p>
                    </div>
                    <Button onClick={handleDeleteAccount} variant="destructive" className="bg-red-500 hover:bg-red-600"><AlertTriangle className="w-4 h-4 mr-2" />Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, CreditCard, Globe, Camera, Save, Upload, Trash2, Phone, MapPin, Link as LinkIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import PaymentMethods from "@/components/shared/payment-methods"

export default function ClientSettings() {
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    professionalBio: "",
    skills: [] as string[],
    portfolioWebsite: "",
    location: "",
    image: "",
    email: "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  })

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "utc",
    currency: "inr",
    hourlyRate: "",
    theme: "dark",
  })

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  // Common skills list
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

  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()

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

    setProfile(prev => ({
      ...prev,
      email: initialEmail,
      fullName: initialFullName,
      phone: stored?.phone || prev.phone,
      professionalBio: stored?.professionalBio || prev.professionalBio,
      portfolioWebsite: stored?.portfolioWebsite || prev.portfolioWebsite,
      location: stored?.location || prev.location,
      image: stored?.image || prev.image,
      skills: Array.isArray(stored?.skills) ? stored!.skills : (stored?.skills ? stored.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : prev.skills),
    }))
  }, [session])

  useEffect(() => {
    if (profile.skills && profile.skills.length > 0) {
      setSelectedSkills(Array.isArray(profile.skills) ? profile.skills : [])
    }
  }, [profile.skills])

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
        const email = profile.email || session?.user?.email || localStorage.getItem("email")

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
            setProfile(prev => ({ ...prev, image: data.image }))
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
    const email = profile.email || session?.user?.email || localStorage.getItem("email")
    if (!email) return

    try {
      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null, email }),
      })

      if (response.ok) {
        setProfile(prev => ({ ...prev, image: "" }))
        toast({ title: "Success", description: "Profile image removed" })
        router.refresh()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove image", variant: "destructive" })
    }
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone.replace(/\D/g, ""))
  }

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "")
    const limitedDigits = digitsOnly.slice(0, 10)

    setProfile(prev => ({ ...prev, phone: limitedDigits }))

    if (limitedDigits.length > 0 && limitedDigits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits")
    } else {
      setPhoneError("")
    }
  }


  const handleLocationChange = async (value: string) => {
    setProfile(prev => ({ ...prev, location: value }))

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

  const selectLocation = (location: string) => {
    setProfile(prev => ({ ...prev, location }))
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
  }

  const handleSaveProfile = async () => {
    const email = profile.email || session?.user?.email || localStorage.getItem("email")
    if (!email) {
      toast({ title: "Error", description: "Email not found. Please log in again.", variant: "destructive" })
      return
    }

    // Validate phone number
    if (profile.phone && !validatePhone(profile.phone)) {
      setPhoneError("Phone number must be exactly 10 digits")
      toast({ title: "Validation Error", description: "Phone number must be exactly 10 digits", variant: "destructive" })
      return
    }

    // Validate portfolio website URL
    if (profile.portfolioWebsite && !profile.portfolioWebsite.match(/^https?:\/\/.+/)) {
      toast({ title: "Validation Error", description: "Portfolio website must be a valid URL (starting with http:// or https://)", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const body = {
        email,
        fullName: profile.fullName,
        phone: profile.phone,
        bio: profile.professionalBio,
        skills: selectedSkills.length > 0 ? selectedSkills.join(",") : (Array.isArray(profile.skills) ? profile.skills.join(",") : profile.skills),
        notifications,
        privacy,
        preferences,
        portfolioWebsite: profile.portfolioWebsite,
        location: profile.location,
        image: profile.image,
      }

      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update profile")

      const newName = data.user?.fullName || profile.fullName
      if (typeof window !== "undefined") {
        localStorage.setItem("fullName", newName || "")
        localStorage.setItem("email", email)
        localStorage.setItem("currentUser", JSON.stringify(data.user || { email, fullName: newName }))
      }

      toast({ title: "Success", description: "Profile updated", variant: "default" })
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

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      toast({ title: "Auth required", description: "Please log in before changing password.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
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

      toast({ title: "Success", description: "Password updated. Please login with the new password.", variant: "default" })

      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
      setPasswords({ current: "", new: "", confirm: "" })
      router.refresh()
    } catch (err: any) {
      console.error("Password update error:", err)
      toast({ title: "Error", description: err.message || "Failed to update password", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Account Settings</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gray-400 to-slate-500 bg-clip-text text-transparent">Account Settings</span>
        </h1>
        <p className="text-xl text-gray-300">Manage your account preferences and security</p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white text-white hover:bg-white/10"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white text-white hover:bg-white/10"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white text-white hover:bg-white/10"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white text-white hover:bg-white/10"><CreditCard className="w-4 h-4 mr-2" />Payment</TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-white text-white hover:bg-white/10"><Globe className="w-4 h-4 mr-2" />Preferences</TabsTrigger>
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
                    <Avatar className="w-24 h-24 border-2 border-white/20">
                      <AvatarImage src={profile.image || "/placeholder.svg?height=96&width=96&text=Client"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                        {profile.fullName?.[0] || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-400 mb-3">Upload a professional photo</p>
                    <div className="flex gap-2">
                      <label htmlFor="client-image-upload" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer hover:text-white"
                          disabled={uploadingImage}
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingImage ? "Uploading..." : "Upload"}
                          </span>
                        </Button>
                        <input
                          id="client-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <Button
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">First Name</label>
                    <Input value={profile.fullName?.split(" ")[0] || ""} onChange={e => setProfile(prev => ({ ...prev, fullName: `${e.target.value} ${prev.fullName?.split(" ").slice(1).join(" ") || ""}` }))} className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Last Name</label>
                    <Input value={profile.fullName?.split(" ").slice(1).join(" ") || ""} onChange={e => setProfile(prev => ({ ...prev, fullName: `${prev.fullName?.split(" ")[0] || ""} ${e.target.value}` }))} className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                    <Input value={profile.email || (session?.user?.email ?? "")} onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))} type="email" className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Phone (10 digits)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-10 ${phoneError ? "border-red-500" : ""}`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-red-400 text-xs mt-1">{phoneError}</p>
                    )}
                    {profile.phone && !phoneError && (
                      <p className="text-green-400 text-xs mt-1">Valid phone number</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={profile.location}
                      onChange={e => handleLocationChange(e.target.value)}
                      onFocus={() => profile.location.length > 2 && setShowLocationSuggestions(true)}
                      placeholder="Enter your location"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-10"
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {locationSuggestions.map((prediction) => (
                          <div
                            key={prediction.place_id}
                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                            onClick={() => selectLocation(prediction.description)}
                          >
                            {prediction.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {profile.location && (
                    <div className="mt-2">
                      <iframe
                        width="100%"
                        height="150"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=-180,-90,180,90&layer=mapnik&marker=${encodeURIComponent(profile.location)}`}
                        className="rounded-lg"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(profile.location)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View larger map
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Portfolio Website</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="url"
                      value={profile.portfolioWebsite}
                      onChange={e => setProfile(prev => ({ ...prev, portfolioWebsite: e.target.value }))}
                      placeholder="https://yourportfolio.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-10"
                    />
                  </div>
                  {profile.portfolioWebsite && (
                    <a
                      href={profile.portfolioWebsite.startsWith("http") ? profile.portfolioWebsite : `https://${profile.portfolioWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Visit Portfolio
                    </a>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Bio</label>
                  <Textarea value={profile.professionalBio} onChange={e => setProfile(prev => ({ ...prev, professionalBio: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Skills & Expertise</label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!selectedSkills.includes(value)) {
                        const newSkills = [...selectedSkills, value]
                        setSelectedSkills(newSkills)
                        setProfile(prev => ({ ...prev, skills: newSkills }))
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-400">
                      <SelectValue placeholder="Select a skill to add" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-[200px]">
                      {availableSkills
                        .filter(skill => !selectedSkills.includes(skill))
                        .map((skill) => (
                          <SelectItem key={skill} value={skill} className="text-gray-100 hover:bg-gray-700">
                            {skill}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedSkills.length > 0 ? selectedSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/10 text-white cursor-pointer hover:bg-white/20"
                        onClick={() => {
                          const newSkills = selectedSkills.filter((_, i) => i !== index)
                          setSelectedSkills(newSkills)
                          setProfile(prev => ({ ...prev, skills: newSkills }))
                        }}
                      >
                        {skill} ×
                      </Badge>
                    )) : (Array.isArray(profile.skills) ? profile.skills : []).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/10 text-white cursor-pointer hover:bg-white/20"
                        onClick={() => {
                          const newSkills = (profile.skills || []).filter((_, i) => i !== index)
                          setProfile(prev => ({ ...prev, skills: newSkills }))
                        }}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                    {selectedSkills.length === 0 && (!profile.skills || profile.skills.length === 0) && (
                      <p className="text-gray-400 text-sm">No skills selected. Use the dropdown above to add skills.</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                    <Switch checked={notifications.email} onCheckedChange={(v: boolean) => setNotifications(prev => ({ ...prev, email: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Push Notifications</h3>
                      <p className="text-sm text-gray-400">Receive push notifications on your device</p>
                    </div>
                    <Switch checked={notifications.push} onCheckedChange={(v: boolean) => setNotifications(prev => ({ ...prev, push: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">SMS Notifications</h3>
                      <p className="text-sm text-gray-400">Receive important updates via SMS</p>
                    </div>
                    <Switch checked={notifications.sms} onCheckedChange={(v: boolean) => setNotifications(prev => ({ ...prev, sms: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Marketing Communications</h3>
                      <p className="text-sm text-gray-400">Receive promotional emails and updates</p>
                    </div>
                    <Switch checked={notifications.marketing} onCheckedChange={(v: boolean) => setNotifications(prev => ({ ...prev, marketing: v }))} />
                  </div>
                </div>

                <Button onClick={() => { /* optionally persist notifications locally */ }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
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
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Current Password</label>
                      <Input value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} type="password" className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">New Password</label>
                      <Input value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} type="password" className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Confirm New Password</label>
                      <Input value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} type="password" className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                    </div>
                  </div>

                  <Button onClick={handlePasswordUpdate} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Profile Visibility</h3>
                      <p className="text-sm text-gray-400">Make your profile visible to freelancers</p>
                    </div>
                    <Switch checked={privacy.profileVisible} onCheckedChange={(v: boolean) => setPrivacy(prev => ({ ...prev, profileVisible: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Show Email</h3>
                      <p className="text-sm text-gray-400">Display email on your profile</p>
                    </div>
                    <Switch checked={privacy.showEmail} onCheckedChange={(v: boolean) => setPrivacy(prev => ({ ...prev, showEmail: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Allow Messages</h3>
                      <p className="text-sm text-gray-400">Allow freelancers to message you directly</p>
                    </div>
                    <Switch checked={privacy.allowMessages} onCheckedChange={(v: boolean) => setPrivacy(prev => ({ ...prev, allowMessages: v }))} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <PaymentMethods />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Language</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white" value={preferences.language} onChange={e => setPreferences(prev => ({ ...prev, language: e.target.value }))}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Timezone</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white" value={preferences.timezone} onChange={e => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}>
                      <option value="utc">UTC</option>
                      <option value="est">Eastern Time</option>
                      <option value="pst">Pacific Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Currency</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white" value={preferences.currency} onChange={e => setPreferences(prev => ({ ...prev, currency: e.target.value }))}>
                                            <option value="inr">INR (₹)</option>
                                            <option value="usd">USD ($)</option>
                                            <option value="eur">EUR (€)</option>
                                            <option value="gbp">GBP (£)</option>
                                          </select>                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Theme</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white" value={preferences.theme} onChange={e => setPreferences(prev => ({ ...prev, theme: e.target.value }))}>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}


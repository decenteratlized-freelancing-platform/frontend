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
import { Settings, User, Bell, Shield, CreditCard, Globe, Camera, Save, Upload, Trash2, Phone, MapPin, Link as LinkIcon, X, LogOut, AlertTriangle, Lock, Key, Mail } from "lucide-react"
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
import { Loader2 } from "lucide-react"

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-gray-800 animate-pulse rounded-lg" />
})

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

  // Notifications state kept for now to avoid breaking saves, but tab will be hidden
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
    currency: "eth",
    timezone: "ist",
    hourlyRate: "",
    theme: "dark",
  })

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null)

  // Confirmation Modals State
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
  const [isDeleting, setIsDeleteing] = useState(false)

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

  const { data: session, update } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchFullProfile = async () => {
      const email = session?.user?.email || localStorage.getItem("email");
      if (!email) return;

      try {
        const response = await fetch(`/api/settings?email=${email}`);
        const data = await response.json();

        if (response.ok) {
          const p = data.profile || {};
          const s = data.settings || {};

          setProfile({
            fullName: p.fullName || "",
            email: p.email || email,
            phone: p.phone || "",
            professionalBio: p.professionalBio || "",
            skills: Array.isArray(p.skills) ? p.skills : [],
            portfolioWebsite: p.portfolioWebsite || "",
            location: p.location || "",
            image: p.image || "",
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

    if (session?.user?.email || localStorage.getItem("email")) {
      fetchFullProfile();
    }
  }, [session]);

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
            // await update({ image: data.image })
            localStorage.setItem("userImage", data.image)
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("userImageUpdated"))
            }
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
        // await update({ image: "" })
        localStorage.removeItem("userImage")
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userImageUpdated"))
        }
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

  const selectLocation = (prediction: any) => {
    setProfile(prev => ({ ...prev, location: prediction.description }))
    if (prediction.lat && prediction.lon) {
      setMapCoordinates({ lat: parseFloat(prediction.lat), lon: parseFloat(prediction.lon) })
    }
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
  }

  const handleSaveProfile = async () => {
    const email = profile.email || session?.user?.email || localStorage.getItem("email")
    if (!email) {
      toast({ title: "Error", description: "Email not found. Please log in again.", variant: "destructive" })
      return
    }

    // 1. Validation
    if (!profile.fullName || profile.fullName.trim().split(" ").length < 2) {
      toast({ title: "Validation Error", description: "Please provide your full name (First and Last name).", variant: "destructive" })
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
      toast({ title: "Validation Error", description: "Company website must be a valid URL (starting with http:// or https://)", variant: "destructive" })
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/update-profile`, {
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
        
        // Dispatch event for sidebar to update
        window.dispatchEvent(new CustomEvent("userProfileUpdated", {
            detail: {
                fullName: newName,
                email: email,
                image: data.user?.image || profile.image
            }
        }));
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

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  const handleDeleteAccount = async () => {
    const email = localStorage.getItem("email") || session?.user?.email;
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
                    <UserAvatar
                      user={profile}
                      className="w-24 h-24 border-2 border-white/20 bg-gray-700"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-400 mb-3">Upload a professional photo</p>
                    <div className="flex gap-2">
                      <label htmlFor="client-image-upload" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full bg-white border-white/10 text-black hover:bg-gray-200 cursor-pointer hover:text-black"
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
                        className="bg-white border-white/10 text-black hover:bg-gray-200 hover:text-black"
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
                    <Input value={profile.email || (session?.user?.email ?? "")} disabled type="email" className="bg-white/5 border-white/10 text-gray-400 placeholder:text-gray-400 cursor-not-allowed" />
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
                            onClick={() => selectLocation(prediction)}
                          >
                            {prediction.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Map Display */}
                  {(mapCoordinates || profile.location) && (
                    <div className="mt-2 h-[250px] w-full relative z-0">
                      {mapCoordinates ? (
                        <LeafletMap
                          lat={mapCoordinates.lat}
                          lon={mapCoordinates.lon}
                          zoom={13}
                          popupText={profile.location}
                        />
                      ) : (
                        <div className="h-full w-full bg-white/5 rounded-lg flex items-center justify-center text-gray-400 border border-white/10">
                          Search and select a location to view map
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Company Website</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="url"
                      value={profile.portfolioWebsite}
                      onChange={e => setProfile(prev => ({ ...prev, portfolioWebsite: e.target.value }))}
                      placeholder="https://companywebsite.com"
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

                <Button onClick={handleSaveProfile} disabled={loading} className="bg-white hover:bg-gray-200 text-black">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
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

                  <Button onClick={handlePasswordUpdate} disabled={loading} className="bg-white hover:bg-gray-200 text-black">
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
            <WalletManagement />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-100">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium text-white">Sign Out</h3>
                        <p className="text-sm text-gray-400">Securely log out of your session on this device.</p>
                    </div>
                    <Button onClick={() => setIsLogoutDialogOpen(true)} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                        <h3 className="text-lg font-medium text-red-400">Delete Account</h3>
                        <p className="text-sm text-red-300/70">Permanently delete your account and all data. This action cannot be undone.</p>
                    </div>
                    <Button onClick={() => setIsDeleteAccountDialogOpen(true)} variant="destructive" className="bg-red-500 hover:bg-red-600">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Delete Account
                    </Button>
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
              This action is irreversible. All your project history, posted jobs, and profile data will be permanently removed.
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
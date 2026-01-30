"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  Save,
  Shield,
  CreditCard,
  Globe,
  User,
  Mail,
  Phone,
  MapPin,
  Link,
  Lock,
  Key,
  Settings,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import PaymentMethods from "@/components/shared/payment-methods";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-gray-800 animate-pulse rounded-lg" />
});

interface UserSettings {
  fullName: string;
  email: string;
  image?: string;
  phone?: string;
  location?: string;
  portfolioWebsite?: string;
  professionalBio?: string;
  skills?: string[];
  hourlyRate?: number;
  language?: string;
  timezone?: string;
  currency?: string;
  availabilityStatus?: string;
  workSchedule?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security?: {
    twoFactorEnabled: boolean;
    smsEnabled: boolean;
  };
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [settings, setSettings] = useState<UserSettings>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    portfolioWebsite: "",
    professionalBio: "",
    skills: [],
    hourlyRate: 5000,
    language: "English",
    timezone: "UTC",
    currency: "INR (₹)",
    availabilityStatus: "Available for Work",
    workSchedule: "Full-time",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    security: {
      twoFactorEnabled: false,
      smsEnabled: false,
    },
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null);

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
  ];

  useEffect(() => {
    // Get email from localStorage (for manual login) or session (for OAuth)
    const storedEmail = localStorage.getItem("email") || session?.user?.email || "";
    const storedName = localStorage.getItem("fullName") || session?.user?.name || "";
    const storedRole = localStorage.getItem("role") || "";

    if (storedEmail) {
      setSettings(prev => ({
        ...prev,
        fullName: storedName,
        email: storedEmail,
      }));
      fetchSettings(storedEmail);
    }
  }, [session]);

  const fetchSettings = async (email: string) => {
    try {
      const response = await fetch(`/api/settings?email=${email}`);
      const data = await response.json();

      if (response.ok) {
        const skillsArray = Array.isArray(data.settings?.skills)
          ? data.settings.skills
          : (data.settings?.skills ? data.settings.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

        setSelectedSkills(skillsArray);
        setSettings(prev => ({
          ...prev,
          fullName: data.profile?.fullName || prev.fullName,
          email: data.profile?.email || prev.email,
          image: data.profile?.image,
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
          portfolioWebsite: data.profile?.portfolioWebsite || "",
          professionalBio: data.profile?.professionalBio || "",
          skills: skillsArray,
          hourlyRate: data.settings?.hourlyRate || 5000,
          language: data.settings?.preferences?.language || "English",
          timezone: data.settings?.preferences?.timezone || "UTC",
          currency: data.settings?.preferences?.currency || "INR (₹)",
          availabilityStatus: data.settings?.availableForJobs ? "Available for Work" : "Not Available",
          workSchedule: data.settings?.workSchedule || "Full-time",
          notifications: {
            email: data.settings?.notifications?.email ?? true,
            push: data.settings?.notifications?.push ?? true,
            sms: data.settings?.notifications?.sms ?? false,
          },
          security: {
            twoFactorEnabled: data.settings?.security?.twoFactorEnabled ?? false,
            smsEnabled: data.settings?.security?.smsEnabled ?? false,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const email = localStorage.getItem("email") || session?.user?.email;

        if (!email) {
          toast({
            title: "Error",
            description: "Email not found. Please log in again.",
            variant: "destructive",
          });
          setUploadingImage(false);
          return;
        }

        try {
          const response = await fetch("/api/user/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: base64String,
              email,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            // await update({ image: data.image }); // Caused Cookie Overflow
            localStorage.setItem("userImage", data.image);
            window.dispatchEvent(new Event("userImageUpdated"));
            setSettings(prev => ({ ...prev, image: data.image }));
            toast({
              title: "Success",
              description: "Profile image updated successfully",
            });
            router.refresh();
          } else {
            throw new Error(data.error || "Failed to upload image");
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to upload image",
            variant: "destructive",
          });
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process image",
        variant: "destructive",
      });
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    const email = localStorage.getItem("email") || session?.user?.email;
    if (!email) return;

    try {
      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: null,
          email,
        }),
      });

      if (response.ok) {
        // await update({ image: "" });
        localStorage.removeItem("userImage");
        window.dispatchEvent(new Event("userImageUpdated"));
        setSettings(prev => ({ ...prev, image: "" }));
        toast({
          title: "Success",
          description: "Profile image removed",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  const handlePhoneChange = (value: string) => {
    // Remove non-digits
    const digitsOnly = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);

    setSettings(prev => ({ ...prev, phone: limitedDigits }));

    if (limitedDigits.length > 0 && limitedDigits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleLocationChange = async (value: string) => {
    setSettings(prev => ({ ...prev, location: value }));

    if (value.length > 2) {
      try {
        const response = await fetch(`/api/location/search?query=${encodeURIComponent(value)}`);
        const data = await response.json();
        if (data.predictions) {
          setLocationSuggestions(data.predictions);
          setShowLocationSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (prediction: any) => {
    setSettings(prev => ({ ...prev, location: prediction.description }));
    if (prediction.lat && prediction.lon) {
      setMapCoordinates({ lat: parseFloat(prediction.lat), lon: parseFloat(prediction.lon) });
    }
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  const handleSaveProfile = async () => {
    const email = localStorage.getItem("email") || session?.user?.email;

    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number
    if (settings.phone && !validatePhone(settings.phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    // Validate portfolio website URL
    if (settings.portfolioWebsite && !settings.portfolioWebsite.match(/^https?:\/\/.+/)) {
      toast({
        title: "Validation Error",
        description: "Portfolio website must be a valid URL (starting with http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Send update to backend server (same DB as register/login)
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: settings.fullName,
          phone: settings.phone,
          bio: settings.professionalBio,
          skills: selectedSkills.length > 0 ? selectedSkills.join(", ") : settings.skills?.join(", ") || "",
          notifications: settings.notifications,
          privacy: settings.security,
          preferences: {
            language: settings.language,
            timezone: settings.timezone,
            currency: settings.currency,
            hourlyRate: settings.hourlyRate,
          },
          portfolioWebsite: settings.portfolioWebsite,
          location: settings.location,
        }),
      });

      const data = await response.json();
      console.log("Update profile response:", data);

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile settings updated successfully",
        });

        // Keep local app in sync
        const newName = data.user?.fullName || settings.fullName;
        localStorage.setItem("fullName", newName);
        localStorage.setItem("email", email);
        // Refresh UI (revalidate server components / session)
        router.refresh();

      } else {
        throw new Error(data.message || "Failed to update settings");
      }
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    const email = localStorage.getItem("email") || session?.user?.email;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in before changing password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call backend change-password route that validates JWT and updates DB
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
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast({
        title: "Success",
        description: "Password updated successfully. Please login with the new password.",
      });

      // Clear local credentials and force user to re-login for security
      localStorage.removeItem("token");
      // optional: keep email for convenience but remove session info
      // localStorage.removeItem("currentUser");
      setPasswords({ current: "", new: "", confirm: "" });

      // force UI refresh / sign out client session if using next-auth
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    const email = localStorage.getItem("email") || session?.user?.email;

    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          language: settings.language,
          timezone: settings.timezone,
          currency: settings.currency,
          availabilityStatus: settings.availabilityStatus,
          hourlyRate: settings.hourlyRate,
          workSchedule: settings.workSchedule,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Preferences saved successfully",
        });
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Account Settings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-gray-400 to-slate-500 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Manage your freelancer profile and preferences
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-600 hover:text-white"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-600 hover:text-white"
            >
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-600 hover:text-white"
            >
              <CreditCard className="w-4 h-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-600 hover:text-white"
            >
              <Globe className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <UserAvatar
                        user={{ name: settings.fullName, image: settings.image }}
                        className="w-32 h-32 border-4 border-gray-600"
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-green-500 hover:bg-green-600 border-2 border-gray-800"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <label htmlFor="image-upload" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full bg-white border-gray-600 text-black hover:bg-gray-200 hover:text-black cursor-pointer"
                        disabled={uploadingImage}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingImage ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <Button
                      variant="outline"
                      className="flex-1 bg-white border-gray-600 text-black hover:bg-gray-200 hover:text-black"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                        <Input
                          id="firstName"
                          value={settings.fullName?.split(" ")[0] || ""}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            fullName: `${e.target.value} ${prev.fullName?.split(" ").slice(1).join(" ") || ""}`
                          }))}
                          className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                        <Input
                          id="lastName"
                          value={settings.fullName?.split(" ").slice(1).join(" ") || ""}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            fullName: `${prev.fullName?.split(" ")[0] || ""} ${e.target.value}`
                          }))}
                          className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            value={settings.email}
                            disabled
                            className="bg-gray-700 border-gray-600 text-gray-400 pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-gray-300">Phone (10 digits)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="1234567890"
                            maxLength={10}
                            className={`bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500 ${phoneError ? "border-red-500" : ""}`}
                          />
                        </div>
                        {phoneError && (
                          <p className="text-red-400 text-xs mt-1">{phoneError}</p>
                        )}
                        {settings.phone && !phoneError && (
                          <p className="text-green-400 text-xs mt-1">Valid phone number</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-gray-300">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="location"
                            value={settings.location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onFocus={() => settings.location && settings.location.length > 2 && setShowLocationSuggestions(true)}
                            placeholder="Enter your location"
                            className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
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

                        {(mapCoordinates || settings.location) && (
                          <div className="mt-2 h-[250px] w-full relative z-0">
                            {mapCoordinates ? (
                              <LeafletMap
                                lat={mapCoordinates.lat}
                                lon={mapCoordinates.lon}
                                zoom={13}
                                popupText={settings.location}
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 border border-gray-700">
                                Search and select a location to view map
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-gray-300">Portfolio Website</Label>
                        <div className="relative">
                          <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="website"
                            type="url"
                            value={settings.portfolioWebsite}
                            onChange={(e) => setSettings(prev => ({ ...prev, portfolioWebsite: e.target.value }))}
                            placeholder="https://yourportfolio.com"
                            className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
                          />
                        </div>
                        {settings.portfolioWebsite && (
                          <a
                            href={settings.portfolioWebsite.startsWith("http") ? settings.portfolioWebsite : `https://${settings.portfolioWebsite}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-flex items-center gap-1"
                          >
                            <Link className="w-3 h-3" />
                            Visit Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Professional Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={settings.professionalBio}
                      onChange={(e) => setSettings(prev => ({ ...prev, professionalBio: e.target.value }))}
                      placeholder="Tell us about your professional experience..."
                      className="bg-gray-700 border-gray-600 text-gray-100 min-h-[100px] focus:border-blue-500"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Input
                        value={skillInput}
                        onChange={(e) => {
                          setSkillInput(e.target.value);
                          setShowSkillSuggestions(true);
                        }}
                        onFocus={() => setShowSkillSuggestions(true)}
                        placeholder="Type a skill (e.g. React, Python)..."
                        className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                      />
                      {showSkillSuggestions && skillInput && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                          {availableSkills
                            .filter(
                              (skill) =>
                                !selectedSkills.includes(skill) &&
                                skill.toLowerCase().includes(skillInput.toLowerCase())
                            )
                            .map((skill) => (
                              <div
                                key={skill}
                                className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-200"
                                onClick={() => {
                                  if (!selectedSkills.includes(skill)) {
                                    const newSkills = [...selectedSkills, skill];
                                    setSelectedSkills(newSkills);
                                    setSettings((prev) => ({
                                      ...prev,
                                      skills: newSkills,
                                    }));
                                    setSkillInput("");
                                    setShowSkillSuggestions(false);
                                  }
                                }}
                              >
                                {skill}
                              </div>
                            ))}
                          {availableSkills.filter(
                            (skill) =>
                              !selectedSkills.includes(skill) &&
                              skill.toLowerCase().includes(skillInput.toLowerCase())
                          ).length === 0 && (
                              <div className="px-4 py-2 text-sm text-gray-400">
                                No matching skills found
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedSkills.length > 0 ? (
                        selectedSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-600 text-gray-200 cursor-pointer hover:bg-gray-500 flex items-center gap-1"
                            onClick={() => {
                              const newSkills = selectedSkills.filter((_, i) => i !== index);
                              setSelectedSkills(newSkills);
                              setSettings((prev) => ({ ...prev, skills: newSkills }));
                            }}
                          >
                            {skill} <X className="w-3 h-3" />
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No skills selected. Type above to add skills.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </TabsContent >

          {/* Security Tab */}
          < TabsContent value="security" className="mt-6 space-y-6" >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-gray-100 pl-10 pr-10 focus:border-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-gray-100 pl-10 pr-10 focus:border-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black"
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent >

          {/* Preferences Tab */}
          < TabsContent value="preferences" className="mt-6" >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">General Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language" className="text-gray-300">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST (UTC-5)</SelectItem>
                        <SelectItem value="PST">PST (UTC-8)</SelectItem>
                        <SelectItem value="IST">IST (UTC+5:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                        <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                        <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                        <SelectItem value="USD ($)">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Work Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hourlyRate" className="text-gray-300">Hourly Rate (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">₹</span>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={settings.hourlyRate}
                        onChange={(e) => setSettings(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                        className="bg-gray-700 border-gray-600 text-gray-100 pl-8 focus:border-blue-500"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="availability" className="text-gray-300">Availability Status</Label>
                    <Select value={settings.availabilityStatus} onValueChange={(value) => setSettings(prev => ({ ...prev, availabilityStatus: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="Available for Work">Available for Work</SelectItem>
                        <SelectItem value="Busy">Busy</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schedule" className="text-gray-300">Work Schedule</Label>
                    <Select value={settings.workSchedule} onValueChange={(value) => setSettings(prev => ({ ...prev, workSchedule: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black"
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </TabsContent >



          {/* Billing Tab */}
          < TabsContent value="billing" className="mt-6" >
            <PaymentMethods />
          </TabsContent >


        </Tabs >
      </div >

    </div >
  );
}
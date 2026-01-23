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
  Bell, 
  CreditCard, 
  Globe, 
  User,
  Mail,
  Phone,
  MapPin,
  Link,
  Lock,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { data: session } = useSession();
  const { toast } = useToast();
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
        setSettings(prev => ({
          ...prev,
          fullName: data.profile?.fullName || prev.fullName,
          email: data.profile?.email || prev.email,
          image: data.profile?.image,
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
          portfolioWebsite: data.profile?.portfolioWebsite || "",
          professionalBio: data.profile?.professionalBio || "",
          skills: data.settings?.skills || [],
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

    setLoading(true);
    try {
      console.log("Attempting to save profile with email:", email); // Debug log

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: settings.fullName,
          phone: settings.phone,
          location: settings.location,
          portfolioWebsite: settings.portfolioWebsite,
          professionalBio: settings.professionalBio,
          skills: settings.skills,
          hourlyRate: settings.hourlyRate,
          availableForJobs: settings.availabilityStatus === "Available for Work",
        }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile settings updated successfully",
        });
        
        // Update localStorage
        localStorage.setItem("fullName", settings.fullName);
        
        // Update session if available
        if (session?.user) {
          // You might need to implement session update logic here
        }
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
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        throw new Error("Failed to update password");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
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
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-400">Manage your freelancer profile and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-gray-700">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
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
                      <Avatar className="w-32 h-32 border-4 border-gray-600">
                        <AvatarImage src={settings.image} />
                        <AvatarFallback className="bg-gray-700 text-gray-300 text-2xl">
                          {settings.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-green-500 hover:bg-green-600 border-2 border-gray-800"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="outline" className="flex-1 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600">
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
                        <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            value={settings.phone}
                            onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-gray-300">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="location"
                            value={settings.location}
                            onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-gray-300">Portfolio Website</Label>
                        <div className="relative">
                          <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="website"
                            value={settings.portfolioWebsite}
                            onChange={(e) => setSettings(prev => ({ ...prev, portfolioWebsite: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
                          />
                        </div>
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
                      <div className="absolute left-3 top-3 text-gray-400">
                        &lt;/&gt;
                      </div>
                      <Input
                        value={settings.skills?.join(", ") || ""}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          skills: e.target.value.split(",").map(skill => skill.trim()).filter(Boolean)
                        }))}
                        placeholder="React, Node.js, TypeScript, Python..."
                        className="bg-gray-700 border-gray-600 text-gray-100 pl-10 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {settings.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-600 text-gray-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6 space-y-6">
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
                  className="w-full bg-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-100 font-medium">SMS Authentication</p>
                      <p className="text-gray-400 text-sm">Secure your account with SMS codes</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.security?.smsEnabled ?? false}
                    onCheckedChange={(checked: boolean) =>
                      setSettings(prev => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          smsEnabled: checked,
                          twoFactorEnabled: prev.security?.twoFactorEnabled ?? false
                        }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
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
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
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
                        <SelectItem value="USD ($)">USD ($)</SelectItem>
                        <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                        <SelectItem value="GBP (£)">GBP (£)</SelectItem>
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
                    <Label htmlFor="availability" className="text-gray-300">Availability Status</Label>
                    <Select value={settings.availabilityStatus} onValueChange={(value) => setSettings(prev => ({ ...prev, availabilityStatus: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="Available for Work">Available for Work</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                        <SelectItem value="Part-time Only">Part-time Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate" className="text-gray-300">Hourly Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">₹</span>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={settings.hourlyRate}
                        onChange={(e) => setSettings(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                        className="bg-gray-700 border-gray-600 text-gray-100 pl-8 focus:border-blue-500"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="workSchedule" className="text-gray-300">Work Schedule</Label>
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
            </div>
            <Button
              onClick={handleSavePreferences}
              disabled={loading}
              className="mt-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-100 font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={!!settings.notifications?.email}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: checked ?? false,
                          push: prev.notifications?.push ?? false,
                          sms: prev.notifications?.sms ?? false,
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-100 font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={!!settings.notifications?.push}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          push: checked ?? false,
                          email: prev.notifications?.email ?? false,
                          sms: prev.notifications?.sms ?? false,
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-100 font-medium">SMS Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={!!settings.notifications?.sms}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          sms: checked ?? false,
                          email: prev.notifications?.email ?? false,
                          push: prev.notifications?.push ?? false,
                        }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Billing settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
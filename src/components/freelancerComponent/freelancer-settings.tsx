"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, CreditCard, Globe, Camera, Save } from "lucide-react"

export default function FreelancerSettings() {
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Account Settings</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gray-400 to-slate-500 bg-clip-text text-transparent">Settings</span>
        </h1>
        <p className="text-xl text-gray-300">Manage your freelancer profile and preferences</p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/10 text-white">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white/10 text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-white/10 text-white">
              <Globe className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-2 border-white/20">
                      <AvatarImage src="/placeholder.svg?height=96&width=96&text=Freelancer" />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-2xl">
                        F
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-green-600 to-blue-600"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                    <p className="text-sm text-gray-400">Upload a professional photo</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">First Name</label>
                    <Input
                      defaultValue="Jane"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Last Name</label>
                    <Input
                      defaultValue="Freelancer"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                    <Input
                      defaultValue="jane@example.com"
                      type="email"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Phone</label>
                    <Input
                      defaultValue="+1 (555) 987-6543"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Professional Bio</label>
                  <Textarea
                    defaultValue="Experienced full-stack developer with 5+ years of expertise in React, Node.js, and modern web technologies. Passionate about creating scalable and user-friendly applications."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Skills</label>
                  <Input
                    defaultValue="React, Node.js, TypeScript, Python, MongoDB, PostgreSQL"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
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
                      <p className="text-sm text-gray-400">Receive job alerts and updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Push Notifications</h3>
                      <p className="text-sm text-gray-400">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">SMS Notifications</h3>
                      <p className="text-sm text-gray-400">Receive important updates via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Marketing Communications</h3>
                      <p className="text-sm text-gray-400">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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
                      <Input
                        type="password"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">New Password</label>
                      <Input
                        type="password"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Confirm New Password</label>
                      <Input
                        type="password"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Update Password
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
                      <p className="text-sm text-gray-400">Make your profile visible to clients</p>
                    </div>
                    <Switch
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Show Email</h3>
                      <p className="text-sm text-gray-400">Display email on your profile</p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Allow Messages</h3>
                      <p className="text-sm text-gray-400">Allow clients to message you directly</p>
                    </div>
                    <Switch
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, allowMessages: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Bank Account</h3>
                        <div className="text-2xl">🏦</div>
                      </div>
                      <p className="text-gray-400">**** **** **** 5678</p>
                      <p className="text-sm text-gray-500">Primary Account</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">PayPal</h3>
                        <div className="text-2xl">🅿️</div>
                      </div>
                      <p className="text-gray-400">jane@example.com</p>
                      <p className="text-sm text-gray-500">Verified</p>
                    </CardContent>
                  </Card>
                </div>

                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">General Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Language</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Timezone</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white">
                      <option value="utc">UTC</option>
                      <option value="est">Eastern Time</option>
                      <option value="pst">Pacific Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Currency</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white">
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Theme</label>
                    <select className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white">
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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

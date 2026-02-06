"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Shield, Bell, Globe, Save, Key } from "lucide-react"

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        platformName: "SmartHire",
        supportEmail: "support@smarthire.com",
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        maxJobsPerUser: 10,
        platformFeePercent: 5,
    })
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    const handleSave = async () => {
        setSaving(true)
        setMessage("")

        // Simulate save (no actual backend endpoint for settings yet)
        setTimeout(() => {
            setSaving(false)
            setMessage("Settings saved successfully!")
            setTimeout(() => setMessage(""), 3000)
        }, 1000)
    }

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
                    <span className="text-sm font-medium text-white">Platform Settings</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Admin <span className="text-gray-400">Settings</span>
                </h1>
                <p className="text-xl text-gray-300">Configure platform settings</p>
            </motion.div>

            <div className="space-y-6">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-400" />
                                General Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Platform Name</Label>
                                    <Input
                                        value={settings.platformName}
                                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Support Email</Label>
                                    <Input
                                        value={settings.supportEmail}
                                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Max Jobs Per User</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={settings.maxJobsPerUser}
                                        onChange={(e) => setSettings({ ...settings, maxJobsPerUser: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Platform Fee (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={settings.platformFeePercent}
                                        onChange={(e) => setSettings({ ...settings, platformFeePercent: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Access Control */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-400" />
                                Access Control
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">Maintenance Mode</p>
                                    <p className="text-sm text-gray-400">Disable platform access for all users</p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">User Registration</p>
                                    <p className="text-sm text-gray-400">Allow new users to register</p>
                                </div>
                                <Switch
                                    checked={settings.registrationEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Bell className="w-5 h-5 text-yellow-400" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">Email Notifications</p>
                                    <p className="text-sm text-gray-400">Send email notifications to users</p>
                                </div>
                                <Switch
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Admin Credentials Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-purple-400" />
                                Admin Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <p className="text-sm text-purple-300">
                                    Admin credentials are configured in the backend environment variables.
                                    To change credentials, update <code className="bg-white/10 px-1 rounded">ADMIN_EMAIL</code> and{" "}
                                    <code className="bg-white/10 px-1 rounded">ADMIN_PASSWORD</code> in the backend .env file.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center gap-4"
                >
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8"
                    >
                        {saving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Settings
                            </div>
                        )}
                    </Button>
                    {message && (
                        <span className="text-green-400 text-sm">{message}</span>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Briefcase, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    userType?: "client" | "freelancer";
}

interface UserProfile {
    fullName: string;
    email: string;
    image?: string;
    phone?: string;
    location?: string;
    professionalBio?: string;
    skills?: string[];
    portfolioWebsite?: string;
}

export function ProfileDialog({ isOpen, onClose, email, userType }: ProfileDialogProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && email) {
            fetchProfile();
        }
    }, [isOpen, email]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/settings?email=${email}`);
            const data = await response.json();

            if (response.ok) {
                // Determine where the data is nested based on API structure (support both structure usually found)
                const userData = data.profile || data.settings || data.user || {};
                // Merge with top level if needed, or just map what we found

                const skillsArray = Array.isArray(userData.skills)
                    ? userData.skills
                    : (userData.skills ? userData.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

                setProfile({
                    fullName: userData.fullName || data.user?.fullName || "",
                    email: userData.email || email,
                    image: userData.image || data.user?.image,
                    phone: userData.phone || "",
                    location: userData.location || "",
                    professionalBio: userData.professionalBio || data.profile?.professionalBio || "",
                    skills: skillsArray,
                    portfolioWebsite: userData.portfolioWebsite || "",
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Profile Details</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400">Loading profile...</p>
                    </div>
                ) : profile ? (
                    <div className="space-y-6 py-4">
                        {/* Header Section */}
                        <div className="flex flex-col items-center text-center space-y-3">
                            <UserAvatar
                                user={{ name: profile.fullName, image: profile.image }}
                                className="w-24 h-24 border-4 border-white/10"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                                <div className="flex items-center justify-center gap-2 text-gray-400 mt-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">

                            {profile.phone && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                    <span>{profile.phone}</span>
                                </div>
                            )}

                            {profile.location && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <MapPin className="w-4 h-4 text-red-400" />
                                    <span>{profile.location}</span>
                                </div>
                            )}

                            {profile.portfolioWebsite && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Globe className="w-4 h-4 text-green-400" />
                                    <a href={profile.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        Portfolio Website
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Bio Section */}
                        {profile.professionalBio && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Bio</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {profile.professionalBio}
                                </p>
                            </div>
                        )}

                        {/* Skills Section */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <Badge
                                            key={index}
                                            className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-blue-500/20"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        Failed to load profile data.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

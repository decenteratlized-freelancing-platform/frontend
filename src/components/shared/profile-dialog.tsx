"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Globe, Loader2, User, Heart, Star, Briefcase, Github, Linkedin, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface ProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    userType?: "client" | "freelancer";
}

interface UserProfile {
    id?: string;
    fullName: string;
    email: string;
    image?: string;
    phone?: string;
    location?: string;
    professionalBio?: string;
    skills?: string[];
    portfolioWebsite?: string;
    role?: string;
    // Privacy Flags
    privacy?: {
        showEmail: boolean;
        showPhone: boolean;
    };
    // New Fields
    portfolio?: { title: string; description: string; url: string }[];
    socialLinks?: { github?: string; linkedin?: string; twitter?: string; website?: string };
    verifiedSkills?: { skill: string; score: number }[];
}

export function ProfileDialog({ isOpen, onClose, email, userType }: ProfileDialogProps) {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isTogglingFav, setIsTogglingFav] = useState(false);

    const ensureToken = async () => {
        let token = localStorage.getItem("token");
        if (!token && session?.user?.email) {
            try {
                const devRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/dev-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: session.user.email })
                });
                if (devRes.ok) {
                    const data = await devRes.json();
                    token = data.token;
                    localStorage.setItem("token", token || "");
                }
            } catch (e) { console.error("Auto-token failed", e); }
        }
        return token;
    };

    useEffect(() => {
        if (isOpen && email) {
            fetchProfile();
        }
    }, [isOpen, email, session]); 

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/settings?email=${email}`);
            const data = await response.json();

            if (response.ok) {
                const userData = data.profile || data.settings || data.user || {};
                const settingsData = data.settings || {};
                const profileId = data.user?._id || userData._id;
                
                const skillsArray = Array.isArray(userData.skills)
                    ? userData.skills
                    : (userData.skills ? userData.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

                const profileData = {
                    id: profileId,
                    fullName: userData.fullName || data.user?.fullName || "Anonymous",
                    email: userData.email || email,
                    image: userData.image || data.user?.image,
                    phone: userData.phone || settingsData.phone || "",
                    location: userData.location || settingsData.location || "",
                    professionalBio: userData.professionalBio || data.profile?.professionalBio || "",
                    skills: skillsArray,
                    portfolioWebsite: userData.portfolioWebsite || settingsData.portfolioWebsite || "",
                    role: userType || data.role || "User",
                    privacy: {
                        showEmail: settingsData.privacy?.showEmail ?? false,
                        showPhone: settingsData.privacy?.showPhone ?? false,
                    },
                    // New Fields
                    portfolio: userData.portfolio || settingsData.portfolio || [],
                    socialLinks: userData.socialLinks || settingsData.socialLinks || {},
                    verifiedSkills: userData.verifiedSkills || settingsData.verifiedSkills || []
                };
                
                setProfile(profileData);

                // Check favorite status if ID available
                if (profileId) {
                    const token = await ensureToken(); 
                    if (token) {
                        const favRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/favorites`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (favRes.ok) {
                            const favData = await favRes.json();
                            setIsFavorite(favData.freelancers?.some((f: any) => f._id === profileId));
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!profile?.id) return;
        const token = await ensureToken();
        if (!token) {
            toast({ title: "Auth Required", description: "Log in to save favorites", variant: "destructive" });
            return;
        }
        setIsTogglingFav(true);
        try {
            const endpoint = isFavorite ? "/api/user/favorites/remove" : "/api/user/favorites/add";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ freelancerId: profile.id })
            });
            if (res.ok) {
                setIsFavorite(!isFavorite);
                toast({ title: isFavorite ? "Removed" : "Saved", description: isFavorite ? "Removed from favorites" : "Saved to favorites" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsTogglingFav(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl p-0 overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-zinc-500 text-sm font-medium">Loading profile...</p>
                    </div>
                ) : profile ? (
                    <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
                        {/* Sidebar / Header Section */}
                        <div className="bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-8 flex flex-col items-center text-center relative md:w-1/3 min-w-[250px]">
                            {/* ... (Gradient and Fav Button) */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20" />
                            
                            {userType === "client" && profile.id && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleFavorite}
                                    disabled={isTogglingFav}
                                    className={`absolute top-4 right-4 rounded-full transition-all ${isFavorite ? "text-pink-500 hover:text-pink-600 bg-pink-500/10" : "text-zinc-500 hover:text-pink-400 hover:bg-pink-500/5"}`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                                </Button>
                            )}

                            <UserAvatar
                                user={{ name: profile.fullName, image: profile.image }}
                                className="w-32 h-32 border-4 border-zinc-950 shadow-xl mb-4"
                            />
                            <h2 className="text-xl font-bold text-white tracking-tight">{profile.fullName}</h2>
                            <div className="flex items-center gap-2 mt-2 mb-6">
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700 capitalize">
                                    {profile.role}
                                </Badge>
                            </div>

                            {/* Contact Grid - Sidebar */}
                            <div className="w-full space-y-3 text-left">
                                {profile.email && profile.privacy?.showEmail && (
                                    <div className="flex items-center gap-3 text-xs text-zinc-400 truncate">
                                        <Mail className="w-4 h-4" /> {profile.email}
                                    </div>
                                )}
                                {profile.phone && profile.privacy?.showPhone && (
                                    <div className="flex items-center gap-3 text-xs text-zinc-400 truncate">
                                        <Phone className="w-4 h-4" /> {profile.phone}
                                    </div>
                                )}
                                {profile.location && (
                                    <div className="flex items-center gap-3 text-xs text-zinc-400 truncate">
                                        <MapPin className="w-4 h-4" /> {profile.location}
                                    </div>
                                )}
                                {/* Social Links */}
                                {profile.socialLinks && (
                                    <div className="flex gap-2 justify-center mt-4 pt-4 border-t border-zinc-800">
                                        {profile.socialLinks.github && <a href={`https://${profile.socialLinks.github.replace(/^https?:\/\//, '')}`} target="_blank" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"><Github className="w-5 h-5"/></a>}
                                        {profile.socialLinks.linkedin && <a href={`https://${profile.socialLinks.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"><Linkedin className="w-5 h-5"/></a>}
                                        {profile.socialLinks.twitter && <a href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`} target="_blank" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"><Twitter className="w-5 h-5"/></a>}
                                        {profile.socialLinks.website && <a href={profile.socialLinks.website} target="_blank" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"><Globe className="w-5 h-5"/></a>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                            
                            {/* Bio Section */}
                            {profile.professionalBio && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-2">About <div className="h-px flex-1 bg-zinc-800" /></h3>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{profile.professionalBio}</p>
                                </div>
                            )}

                            {/* Skills Section */}
                            {(profile.skills?.length || 0) > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-2">Skills <div className="h-px flex-1 bg-zinc-800" /></h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills?.map((skill, index) => {
                                            const isVerified = profile.verifiedSkills?.some(v => v.skill === skill);
                                            return (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className={`px-3 py-1 font-normal flex items-center gap-1 ${isVerified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-900 text-zinc-300 border-zinc-800"}`}
                                                >
                                                    {skill}
                                                    {isVerified && <Star className="w-3 h-3 fill-current" />}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Portfolio Section */}
                            {(profile.portfolio?.length || 0) > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-2">Portfolio <div className="h-px flex-1 bg-zinc-800" /></h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {profile.portfolio?.map((item, idx) => (
                                            <div key={idx} className="group relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all">
                                                <div className="aspect-video bg-zinc-800 relative">
                                                    {item.url ? (
                                                        <Image src={item.url} alt={item.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><Briefcase className="w-8 h-8"/></div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                                                    <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-zinc-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Failed to load profile data.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
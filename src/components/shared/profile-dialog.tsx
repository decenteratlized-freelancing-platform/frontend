"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Globe, Loader2, User, Heart, Star, Briefcase } from "lucide-react";
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
    }, [isOpen, email, session]); // Add session to deps

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/settings?email=${email}`);
            const data = await response.json();

            if (response.ok) {
                const userData = data.profile || data.settings || data.user || {};
                const profileId = data.user?._id || userData._id;
                
                const skillsArray = Array.isArray(userData.skills)
                    ? userData.skills
                    : (userData.skills ? userData.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

                const profileData = {
                    id: profileId,
                    fullName: userData.fullName || data.user?.fullName || "Anonymous",
                    email: userData.email || email,
                    image: userData.image || data.user?.image,
                    phone: userData.phone || "",
                    location: userData.location || "",
                    professionalBio: userData.professionalBio || data.profile?.professionalBio || "",
                    skills: skillsArray,
                    portfolioWebsite: userData.portfolioWebsite || "",
                    role: userType || "User",
                };
                
                setProfile(profileData);

                // Check favorite status if ID available
                if (profileId) {
                    const token = await ensureToken(); // Use ensureToken
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
        const token = await ensureToken(); // Use ensureToken
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
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md p-0 overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-zinc-500 text-sm font-medium">Loading profile...</p>
                    </div>
                ) : profile ? (
                    <div className="flex flex-col">
                        {/* Header Section */}
                        <div className="bg-zinc-900/50 border-b border-zinc-800 p-8 flex flex-col items-center text-center relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20" />
                            
                            {/* Favorite Button */}
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
                                className="w-24 h-24 border-4 border-zinc-950 shadow-xl mb-4"
                            />
                            <h2 className="text-2xl font-bold text-white tracking-tight">{profile.fullName}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800 border-zinc-700 capitalize">
                                    {profile.role}
                                </Badge>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            
                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                        <Mail className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                                    </div>
                                    <span className="text-zinc-300">{profile.email}</span>
                                </div>

                                {profile.phone && (
                                    <div className="flex items-center gap-3 text-sm group">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                            <Phone className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                                        </div>
                                        <span className="text-zinc-300">{profile.phone}</span>
                                    </div>
                                )}

                                {profile.location && (
                                    <div className="flex items-center gap-3 text-sm group">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                            <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                                        </div>
                                        <span className="text-zinc-300">{profile.location}</span>
                                    </div>
                                )}

                                {profile.portfolioWebsite && (
                                    <div className="flex items-center gap-3 text-sm group">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                            <Globe className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                                        </div>
                                        <a href={profile.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                                            {profile.portfolioWebsite.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Bio Section */}
                            {profile.professionalBio && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-2">
                                        About
                                        <div className="h-px flex-1 bg-zinc-800" />
                                    </h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {profile.professionalBio}
                                    </p>
                                </div>
                            )}

                            {/* Skills Section */}
                            {profile.skills && profile.skills.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-2">
                                        Skills
                                        <div className="h-px flex-1 bg-zinc-800" />
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors px-3 py-1 font-normal"
                                            >
                                                {skill}
                                            </Badge>
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
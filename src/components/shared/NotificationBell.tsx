"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "job_invite" | "proposal_update" | "payment" | "contract_update";
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Fallback polling
      return () => clearInterval(interval);
    }
  }, [session]);

  // Real-time socket listener
  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
        
        // Browser notification if permitted
        if (Notification.permission === "granted") {
            new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico"
            });
        }
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, [socket]);

  const markAllRead = async () => {
    try {
        const token = localStorage.getItem("token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications/mark-all-read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    } catch (error) {
        console.error("Error marking all read:", error);
    }
  };

  const markRead = async (id: string) => {
    try {
        const token = localStorage.getItem("token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications/${id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
        console.error("Error marking read:", error);
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-500/10 text-green-500";
      case "warning": return "bg-yellow-500/10 text-yellow-500";
      case "error": return "bg-red-500/10 text-red-500";
      case "payment": return "bg-emerald-500/10 text-emerald-500";
      case "contract_update": return "bg-blue-500/10 text-blue-500";
      default: return "bg-zinc-500/10 text-zinc-500";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-950 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-100">
        <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                    Mark all read
                </button>
            )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <ScrollArea className="h-[350px]">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-500">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                </div>
            ) : (
                notifications.map((notification) => (
                    <DropdownMenuItem 
                        key={notification._id} 
                        className={`flex items-start gap-3 p-3 focus:bg-zinc-800/50 cursor-pointer ${!notification.read ? 'bg-zinc-800/20' : ''}`}
                        onClick={() => {
                            if (!notification.read) markRead(notification._id);
                            if (notification.link) setIsOpen(false); // Close on click if it's a link
                        }}
                    >
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                        <div className="flex-1 space-y-1">
                            {notification.link ? (
                                <Link href={notification.link} className="block group">
                                    <p className="text-sm font-medium leading-none group-hover:text-blue-400 transition-colors">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </Link>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                            )}
                            <p className="text-[10px] text-zinc-500 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </DropdownMenuItem>
                ))
            )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

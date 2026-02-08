"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "job_invite" | "proposal_update" | "payment" | "contract_update";
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationList() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [session]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-3 w-1/2 bg-white/10" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        {notifications.some(n => !n.read) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllRead}
            className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8"
          >
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-6 py-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-zinc-500">
              <Bell className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                    !notification.read 
                      ? 'bg-blue-500/10 border-blue-500/20' 
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => !notification.read && markRead(notification._id)}
                >
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-600'}`} />
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-tight ${!notification.read ? 'text-white' : 'text-zinc-300'}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {notification.message}
                    </p>

                    {notification.link && (
                      <Link 
                        href={notification.link} 
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2 font-medium"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

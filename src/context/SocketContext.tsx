"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { useToast } from "@/hooks/use-toast";

const SocketContext = createContext<any>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { data: session } = useSession();
    const user = session?.user;

    const { toast } = useToast(); 

    useEffect(() => {
        // Support both regular users (session) and admins (adminToken)
        const adminEmail = typeof window !== 'undefined' ? localStorage.getItem("adminEmail") : null;
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : null;
        
        const effectiveUser = user || (adminToken ? { id: adminEmail, email: adminEmail, role: 'admin' } : null);

        if (effectiveUser) {
            // @ts-ignore
            const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
                query: {
                    // @ts-ignore
                    userId: effectiveUser.id || effectiveUser._id,
                },
            });

            setSocket(socketInstance);

            socketInstance.on("getOnlineUsers", (users: any) => {
                setOnlineUsers(users);
                console.log("Online users:", users);
            });

            // Global message listener for notifications
            socketInstance.on("newMessage", async (message: any) => {
                if (message.senderId !== (effectiveUser.id || (effectiveUser as any)._id)) {
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/${message.senderId}`);
                        const senderData = await res.json();
                        const senderName = senderData.fullName || "Someone";

                        toast({
                            title: `New message from ${senderName}`,
                            description: message.message.substring(0, 50) + (message.message.length > 50 ? "..." : ""),
                            duration: 5000,
                        });
                    } catch (e) {
                        toast({
                            title: "New Message",
                            description: message.message,
                        });
                    }
                }
            });

            // Listen for general notifications (e.g. Proposals)
            socketInstance.on("newNotification", (notification: any) => {
                toast({
                    title: notification.title,
                    description: notification.message,
                    duration: 5000,
                });
            });

            // Dispute Chat Listener
            socketInstance.on("disputeMessage", (data: any) => {
                // If we are not on the dispute page, show a notification
                if (!window.location.pathname.includes(`/disputes/${data.disputeId}`)) {
                    toast({
                        title: "New Dispute Message",
                        description: data.message.message.substring(0, 50) + "...",
                        duration: 5000,
                    });
                }
            });

            return () => {
                socketInstance.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user, toast]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

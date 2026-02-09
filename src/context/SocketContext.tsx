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

    const { toast } = useToast(); // Needs import

    useEffect(() => {
        if (user) {
            // @ts-ignore
            const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
                query: {
                    // @ts-ignore
                    userId: user.id || user._id,
                },
            });

            setSocket(socketInstance);

            socketInstance.on("getOnlineUsers", (users: any) => {
                setOnlineUsers(users);
                console.log("Online users:", users);
            });

            // Global message listener for notifications
            socketInstance.on("newMessage", async (message: any) => {
                // Determine if we should show a notification
                // For now, show it unless we could determine we are in the chat with this person
                // (That check is complex globally, so showing toast is safer for "notification" feature)

                // We might want to fetch sender name if not in message
                // message usually has: message, senderId, receiverId

                // Check if the current page is NOT the messages page or if it is, if the active convo is diff
                // For simplicity in this context, we just show toast.

                if (message.senderId !== (user.id || user._id)) {
                    // Basic sound or visual cue

                    // We need to fetch sender details to show a nice name if possible, 
                    // or just show "New Message"

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

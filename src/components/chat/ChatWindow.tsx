"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/context/SocketContext"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MoreVertical, Phone, Video } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
    _id: string
    senderId: string
    receiverId: string
    message: string
    createdAt: string
}

interface ChatWindowProps {
    receiverId: string
    receiverName: string
    receiverImage?: string
    onClose: () => void
}

export default function ChatWindow({ receiverId, receiverName, receiverImage, onClose }: ChatWindowProps) {
    const { data: session } = useSession()
    const { socket } = useSocket()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    // @ts-ignore
    const currentUserId = session?.user?.id || session?.user?._id

    useEffect(() => {
        if (receiverId && currentUserId) {
            fetchMessages()
        }
    }, [receiverId, currentUserId])

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            if (message.senderId === receiverId) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, receiverId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/${receiverId}?senderId=${currentUserId}`)
            const data = await res.json()
            if (!data.error) {
                setMessages(data)
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/send/${receiverId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: newMessage,
                    senderId: currentUserId,
                }),
            })
            const data = await res.json()
            if (!data.error) {
                setMessages([...messages, data])
                setNewMessage("")
            }
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50"
        >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserAvatar 
                        user={{ name: receiverName, image: receiverImage }} 
                        className="h-10 w-10 border border-white/10"
                    />
                    <div>
                        <h3 className="font-semibold text-white text-sm">{receiverName}</h3>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Online
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8">
                        <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8">
                        <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === currentUserId
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white/10 text-gray-200 rounded-bl-none"
                                    }`}
                            >
                                <p>{msg.message}</p>
                                <span className="text-[10px] opacity-50 mt-1 block text-right">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                    />
                    <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </motion.div>
    )
}

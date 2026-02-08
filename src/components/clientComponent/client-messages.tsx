"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useSocket } from "@/context/SocketContext"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Smile, ArrowLeft, Check, CheckCheck, MessageSquare } from "lucide-react"

interface Message {
  _id: string
  senderId: string
  receiverId: string
  message: string
  attachments?: Array<{ url: string, name: string, fileType: string }>
  createdAt: string
  read?: boolean
}

interface Conversation {
  _id: string
  participant: {
    _id: string
    fullName: string
    email: string
    image?: string
  } | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function ClientMessages() {
  const { data: session } = useSession()
  const { socket, onlineUsers } = useSocket()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [onlineFilter, setOnlineFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const commonEmojis = ["😀", "😂", "🥰", "😍", "😊", "👍", "🙌", "🔥", "✨", "💯", "🚀", "💡", "✅", "❌", "🤝", "💰", "📝", "💻"]

  const searchParams = useSearchParams()
  const receiverId = searchParams?.get('receiverId')

  const sessionUserId = (session?.user as any)?.id || (session?.user as any)?._id

  const getLocalStorageUserId = () => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser)
          return user._id || user.id
        } catch (e) {
          console.error("Error parsing currentUser:", e)
        }
      }
    }
    return null
  }

  const currentUserId = sessionUserId || getLocalStorageUserId()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentUserId) {
      fetchConversations()
    } else {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    async function handleReceiverChange() {
      if (!receiverId || !currentUserId) return;

      const existingConv = conversations.find(c => c.participant?._id === receiverId);

      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/${receiverId}`);
          const userData = await userRes.json();

          if (!userData.error) {
            const newConv: Conversation = {
              _id: "new",
              participant: {
                _id: userData._id,
                fullName: userData.fullName,
                email: userData.email,
                image: userData.image
              },
              lastMessage: "",
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };

            setSelectedConversation(newConv);
            setConversations(prev => {
              if (prev.some(c => c.participant?._id === userData._id)) return prev;
              return [newConv, ...prev];
            });
          }
        } catch (e) {
          console.error("Error fetching receiver details:", e);
        }
      }
    }

    if (!loading) {
      handleReceiverChange();
    }
  }, [receiverId, currentUserId, loading, conversations.length])

  useEffect(() => {
    if (selectedConversation?.participant?._id && currentUserId) {
      fetchMessages(selectedConversation.participant._id)
    }
  }, [selectedConversation, currentUserId])

  useEffect(() => {
    if (socket && selectedConversation?.participant) {
      const handleNewMessage = (message: Message) => {
        if (
          message.senderId === selectedConversation.participant!._id ||
          message.receiverId === selectedConversation.participant!._id
        ) {
          setMessages((prev) => [...prev, message])
        }
        fetchConversations()
      }

      socket.on("newMessage", handleNewMessage)
      return () => {
        socket.off("newMessage", handleNewMessage)
      }
    }
  }, [socket, selectedConversation])

  const fetchConversations = async () => {
    if (!currentUserId) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/conversations?userId=${currentUserId}`)
      const data = await res.json()

      if (!data.error && Array.isArray(data)) {
        setConversations(data)

        if (!receiverId && data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/${otherUserId}?senderId=${currentUserId}`)
      const data = await res.json()
      if (!data.error && Array.isArray(data)) {
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploading(true)
      
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    file: reader.result, 
                    fileName: file.name,
                    fileType: file.type 
                })
            })
            const data = await res.json()
            if (res.ok) {
                // Filter to only include fields expected by the backend Message model
                const attachment = {
                    url: data.url,
                    name: data.name,
                    fileType: data.fileType,
                    size: data.size
                }
                setAttachments(prev => [...prev, attachment])
            } else {
                console.error("Upload failed", data)
            }
        } catch (err) {
            console.error("Upload error", err)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedConversation?.participant?._id) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/send/${selectedConversation.participant._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage || "Sent an attachment",
          senderId: currentUserId,
          attachments
        }),
      })
      const data = await res.json()
      if (!data.error) {
        setMessages([...messages, data])
        setNewMessage("")
        setAttachments([])
        fetchConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isUserOnline = (userId: string) => {
    return onlineUsers?.includes(userId)
  }

  const filteredConversations = conversations.filter((conversation) => {
    if (!conversation.participant) return false

    const matchesSearch =
      conversation.participant.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all"

    const isOnline = isUserOnline(conversation.participant._id)
    const matchesOnline =
      onlineFilter === "all" ||
      (onlineFilter === "online" && isOnline) ||
      (onlineFilter === "offline" && !isOnline)

    return matchesSearch && matchesStatus && matchesOnline
  })

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Please log in to view messages</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh)] flex bg-zinc-950 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-zinc-900 border-r border-zinc-800 flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500/20"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
                variant={statusFilter === "all" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setStatusFilter("all")}
                className="text-xs rounded-full h-7"
            >
                All
            </Button>
            <Button 
                variant={onlineFilter === "online" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setOnlineFilter(onlineFilter === "online" ? "all" : "online")}
                className="text-xs rounded-full h-7"
            >
                Online
            </Button>
            <Button 
                variant={statusFilter === "archived" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setStatusFilter(statusFilter === "archived" ? "all" : "archived")}
                className="text-xs rounded-full h-7"
            >
                Archived
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 opacity-50" />
                </div>
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`flex items-start gap-3 p-4 w-full transition-all duration-200 border-b border-zinc-800/50 hover:bg-zinc-800/50 ${
                    selectedConversation?._id === conversation._id ? "bg-zinc-800 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <UserAvatar
                      user={{
                        name: conversation.participant?.fullName,
                        image: conversation.participant?.image
                      }}
                      className="w-12 h-12 border-2 border-zinc-900"
                    />
                    {conversation.participant && isUserOnline(conversation.participant._id) && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-zinc-100 truncate text-sm">
                        {conversation.participant?.fullName || "Unknown User"}
                      </h3>
                      <span className="text-[10px] text-zinc-500 flex-shrink-0">
                        {new Date(conversation.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : new Date(conversation.lastMessageTime).toLocaleDateString()
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className={`text-sm truncate max-w-[85%] ${conversation.unreadCount > 0 ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                        {conversation.lastMessage || "No messages yet"}
                        </p>
                        {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px]">
                            {conversation.unreadCount}
                        </Badge>
                        )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full bg-zinc-950 relative`}>
        {selectedConversation && selectedConversation.participant ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden text-zinc-400 -ml-2"
                    onClick={() => setSelectedConversation(null)}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <UserAvatar
                  user={{
                    name: selectedConversation.participant.fullName,
                    image: selectedConversation.participant.image
                  }}
                  className="w-10 h-10 border border-zinc-800"
                />
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {selectedConversation.participant.fullName || "Unknown User"}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isUserOnline(selectedConversation.participant._id) ? 'bg-green-500' : 'bg-zinc-600'}`} />
                    <p className="text-xs text-zinc-400">
                        {isUserOnline(selectedConversation.participant._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-950/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 opacity-20" />
                    </div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                    const isOwn = message.senderId === currentUserId;
                    const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);

                    return (
                        <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                        {!isOwn && (
                            <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                                {showAvatar ? (
                                    <UserAvatar
                                        user={{
                                            name: selectedConversation.participant?.fullName,
                                            image: selectedConversation.participant?.image
                                        }}
                                        className="w-8 h-8"
                                    />
                                ) : <div className="w-8" />}
                            </div>
                        )}
                        
                        <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                            <div
                                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                isOwn
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700"
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                                
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                                                                        {message.attachments.map((att, i) => (
                                                                            att.fileType.startsWith("image/") ? (
                                                                                <div key={i} className="rounded-lg overflow-hidden border border-white/10">
                                                                                    <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${att.url}`} alt={att.name} className="max-w-full h-auto object-cover" />
                                                                                </div>
                                                                            ) : (
                                                                                <a key={i} href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${att.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs hover:bg-black/30 transition-colors">
                                                                                    <Paperclip className="w-3 h-3 text-blue-300" /> 
                                                                                    <span className="truncate text-blue-200 underline">{att.name}</span>
                                                                                </a>
                                                                            )
                                                                        ))}                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {isOwn && (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                )}
                            </span>
                        </div>
                        </motion.div>
                    )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              {/* Pending Attachments */}
              {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                      {attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded-full border border-zinc-700">
                              <span className="max-w-[150px] truncate">{att.name}</span>
                              <button 
                                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                  className="hover:text-red-400 transition-colors"
                              >
                                  &times;
                              </button>
                          </div>
                      ))}
                  </div>
              )}

              <div className="flex items-end gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 focus-within:border-blue-500/50 transition-colors">
                <div className="flex gap-1 pb-1">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect} 
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8 ${uploading ? 'opacity-50 animate-pulse' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="relative">
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl grid grid-cols-6 gap-1 z-50 w-52"
                                >
                                    {commonEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                setNewMessage(prev => prev + emoji)
                                                setShowEmojiPicker(false)
                                                inputRef.current?.focus()
                                            }}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors text-lg"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8 ${showEmojiPicker ? 'bg-zinc-800 text-white' : ''}`}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-500 focus-visible:ring-0 min-h-[40px] py-2 px-0"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && attachments.length === 0) || uploading}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg h-9 w-9 mb-0.5 disabled:opacity-50 disabled:bg-zinc-800"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center bg-zinc-950/50">
             <div className="w-24 h-24 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6 border border-zinc-800">
                <MessageSquare className="w-10 h-10 opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
            <p className="max-w-md text-zinc-400">
                Select a conversation from the sidebar to start chatting. You can discuss projects, negotiate terms, and share files.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
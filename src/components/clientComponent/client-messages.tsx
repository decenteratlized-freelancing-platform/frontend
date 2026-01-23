"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/context/SocketContext"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Smile } from "lucide-react"

interface Message {
  _id: string
  senderId: string
  receiverId: string
  message: string
  createdAt: string
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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [onlineFilter, setOnlineFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get user ID from session OR localStorage (for manual login)
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

  // Fetch conversations on mount
  useEffect(() => {
    if (currentUserId) {
      fetchConversations()
    } else {
      setLoading(false)
    }
  }, [currentUserId])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversation?.participant?._id && currentUserId) {
      fetchMessages(selectedConversation.participant._id)
    }
  }, [selectedConversation, currentUserId])

  // Listen for real-time messages
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
      const res = await fetch(`http://localhost:5000/api/messages/conversations?userId=${currentUserId}`)
      const data = await res.json()

      if (!data.error && Array.isArray(data)) {
        setConversations(data)
        if (data.length > 0 && !selectedConversation) {
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
      const res = await fetch(`http://localhost:5000/api/messages/${otherUserId}?senderId=${currentUserId}`)
      const data = await res.json()
      if (!data.error && Array.isArray(data)) {
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation?.participant?._id) return

    try {
      const res = await fetch(`http://localhost:5000/api/messages/send/${selectedConversation.participant._id}`, {
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

    // Note: Status filter is currently mock-only as backend doesn't return status yet
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
        <div className="text-white text-xl">Loading messages...</div>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
        <div className="text-white text-xl">Please log in to view messages</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Messages Interface */}
      <div className="flex w-full h-full relative z-10">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Chats</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={onlineFilter} onValueChange={setOnlineFilter}>
                <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Online" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? "No conversations found" : "No messages yet. Start chatting with freelancers!"}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer transition-all duration-200 rounded-xl ${selectedConversation?._id === conversation._id
                        ? "bg-white/15 border-l-4 border-blue-500"
                        : "hover:bg-white/8"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar 
                          user={{
                            name: conversation.participant?.fullName,
                            image: conversation.participant?.image || "/placeholder.svg"
                          }}
                          className="w-12 h-12"
                        />
                        {conversation.participant && isUserOnline(conversation.participant._id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate">
                            {conversation.participant?.fullName || "Unknown User"}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date(conversation.lastMessageTime).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{conversation.participant?.email || ""}</p>
                        <p className="text-sm text-gray-300 truncate mt-1">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white">{conversation.unreadCount}</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && selectedConversation.participant ? (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 h-full flex flex-col rounded-none border-l-0">
              {/* Chat Header */}
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={{
                        name: selectedConversation.participant.fullName,
                        image: selectedConversation.participant.image || "/placeholder.svg"
                      }}
                      className="w-10 h-10"
                    />
                    <div>
                      <h3 className="font-semibold text-white">
                        {selectedConversation.participant.fullName || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-400">{selectedConversation.participant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.senderId === currentUserId
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-white/10 text-white"
                          }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${message.senderId === currentUserId ? "text-blue-100" : "text-gray-400"
                            }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

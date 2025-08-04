"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Smile } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface Conversation {
  id: number
  name: string
  contact: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  project: string
  status: string
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "TechCorp Inc.",
    contact: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40&text=TC",
    lastMessage: "Great work on the frontend! When can you start the backend?",
    timestamp: "2 min ago",
    unread: 1,
    online: true,
    project: "E-commerce Platform",
    status: "active",
  },
  {
    id: 2,
    name: "StartupXYZ",
    contact: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40&text=SX",
    lastMessage: "The design mockups look perfect. Approved!",
    timestamp: "1 hour ago",
    unread: 0,
    online: false,
    project: "Mobile App Design",
    status: "active",
  },
  {
    id: 3,
    name: "ContentCo",
    contact: "Mike Wilson",
    avatar: "/placeholder.svg?height=40&width=40&text=CC",
    lastMessage: "Please proceed with the blog content creation.",
    timestamp: "3 hours ago",
    unread: 2,
    online: true,
    project: "Content Creation",
    status: "active",
  },
]

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "John Smith",
    content: "Hi! How's the progress on the e-commerce platform?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Great! I've completed the product listing and cart functionality. Working on the checkout process now.",
    timestamp: "10:35 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "John Smith",
    content: "Excellent! The client is very happy with the progress. Keep up the great work!",
    timestamp: "10:40 AM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "You",
    content: "Thank you! I should have the checkout completed by tomorrow.",
    timestamp: "10:45 AM",
    isOwn: true,
  },
  {
    id: 5,
    sender: "John Smith",
    content: "Great work on the frontend! When can you start the backend?",
    timestamp: "2 min ago",
    isOwn: false,
  },
]

export default function FreelancerMessages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [onlineFilter, setOnlineFilter] = useState("all")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        sender: "You",
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Update conversation last message
      const updatedConversations = conversations.map((conv) =>
        conv.id === selectedConversation.id ? { ...conv, lastMessage: newMessage.trim(), timestamp: "now" } : conv,
      )

      // Simulate typing indicator and response
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const response: Message = {
          id: Date.now() + 1,
          sender: selectedConversation.contact,
          content: "Thanks for the update! I'll review this and get back to you soon.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: false,
        }
        setMessages((prev) => [...prev, response])
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter
    const matchesOnline =
      onlineFilter === "all" ||
      (onlineFilter === "online" && conversation.online) ||
      (onlineFilter === "offline" && !conversation.online)

    return matchesSearch && matchesStatus && matchesOnline
  })

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500/8 to-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-teal-500/8 rounded-full blur-3xl animate-pulse" />
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
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer transition-all duration-200 rounded-xl ${
                    selectedConversation.id === conversation.id
                      ? "bg-white/15 border-l-4 border-green-500"
                      : "hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                          {conversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conversation.contact}</p>
                      <p className="text-sm text-gray-300 truncate mt-1">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-500 mt-1">{conversation.project}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="bg-green-500 text-white">{conversation.unread}</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 h-full flex flex-col rounded-none border-l-0">
            {/* Chat Header */}
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                      {selectedConversation.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{selectedConversation.name}</h3>
                    <p className="text-sm text-gray-400">{selectedConversation.project}</p>
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
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isOwn
                        ? "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.isOwn ? "text-green-100" : "text-gray-400"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
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
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

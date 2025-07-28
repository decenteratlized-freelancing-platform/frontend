'use client';
import React, { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";

const DUMMY_USERS = [
  { id: "1", name: "Wade Warren", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "2", name: "Esther Howard", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "3", name: "Jacob Jones", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "4", name: "Kristin Watson", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
];

const CURRENT_USER = "user123";
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".zip"];

export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>(DUMMY_USERS[0].id);
  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>({});
  const [conversations, setConversations] = useState<Record<string, { userId: string; lastMessage: string; time: string; unread: boolean }>>({
    "1": { userId: "1", lastMessage: "", time: "", unread: false },
    "2": { userId: "2", lastMessage: "", time: "", unread: false },
    "3": { userId: "3", lastMessage: "", time: "", unread: false },
    "4": { userId: "4", lastMessage: "", time: "", unread: false },
  });
  const [search, setSearch] = useState("");

  // Filter users by search
  const filteredUsers = DUMMY_USERS.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    // Mark as read
    setConversations((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        unread: false,
      },
    }));
  };

  const handleSend = (userId: string, msg: any) => {
    setMessagesMap((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), msg],
    }));
    // Mark as unread for receiver (simulate)
    setConversations((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        lastMessage: msg.text || msg.fileName || "File shared",
        time: new Date(msg.timestamp).toLocaleTimeString(),
        unread: userId !== selectedUserId, // Only mark as unread if not currently open
      },
    }));
  };

  const handleFileSend = (userId: string, file: File, fileUrl: string) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert("File type not allowed. Allowed: " + ALLOWED_EXTENSIONS.join(", "));
      return;
    }
    const msg = {
      senderId: CURRENT_USER,
      roomId: userId,
      fileUrl,
      fileName: file.name,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    };
    setMessagesMap((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), msg],
    }));
    setConversations((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        lastMessage: msg.fileName,
        time: new Date(msg.timestamp).toLocaleTimeString(),
        unread: userId !== selectedUserId,
      },
    }));
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] gap-4 p-4">
      <Sidebar />
      <ChatList
        users={filteredUsers}
        conversations={conversations}
        onSelect={handleSelectUser}
        selectedId={selectedUserId}
        search={search}
        setSearch={setSearch}
      />
      <div className="flex-1 h-full rounded-2xl bg-white shadow border border-gray-100 flex flex-col">
        <ChatWindow
          roomId={selectedUserId}
          currentUser={CURRENT_USER}
          messages={messagesMap[selectedUserId] || []}
          onSendMessage={(msg) => handleSend(selectedUserId, msg)}
          onSendFileMessage={(file, fileUrl) => handleFileSend(selectedUserId, file, fileUrl)}
        />
      </div>
    </div>
  );
} 
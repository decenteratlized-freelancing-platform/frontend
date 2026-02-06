'use client';
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/chatComponents/Sidebar";
import ChatList from "../../components/chatComponents/ChatList";
import ChatWindow from "../../components/chatComponents/ChatWindow";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";

export default function ChatPage() {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const userId = session?.user?.id || (typeof window !== "undefined" ? localStorage.getItem("userId") : null);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setMessagesMap((prev) => ({
        ...prev,
        [message.senderId]: [...(prev[message.senderId] || []), message],
      }));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  const fetchConversations = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/conversations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0) {
          setSelectedUserId(data[0].participant._id);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (receiverId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/${receiverId}?senderId=${userId}`);
      const data = await res.json();
      if (!data.error) {
        setMessagesMap((prev) => ({
          ...prev,
          [receiverId]: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSelectUser = (receiverId: string) => {
    setSelectedUserId(receiverId);
    fetchMessages(receiverId);
  };

  const handleSend = async (receiverId: string, message: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/send/${receiverId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          senderId: userId,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setMessagesMap((prev) => ({
          ...prev,
          [receiverId]: [...(prev[receiverId] || []), data],
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participant.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex h-screen bg-[#F8FAFC] gap-4 p-4">Loading...</div>;
  }
  
  if (conversations.length === 0) {
    return <div className="flex h-screen bg-[#F8FAFC] gap-4 p-4">No conversations found.</div>;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] gap-4 p-4">
      <Sidebar />
      <ChatList
        users={filteredConversations.map(c => c.participant)}
        conversations={conversations as any}
        onSelect={handleSelectUser}
        selectedId={selectedUserId!}
        search={search}
        setSearch={setSearch}
      />
      {selectedUserId && (
        <div className="flex-1 h-full rounded-2xl bg-white shadow border border-gray-100 flex flex-col">
          <ChatWindow
            roomId={selectedUserId}
            currentUser={userId || ""}
            messages={messagesMap[selectedUserId] || []}
            onSendMessage={(msg) => handleSend(selectedUserId, msg.text || "")}
            onSendFileMessage={(file, fileUrl) => {
              // This is a placeholder, as the backend does not support file sending yet
            }}
          />
        </div>
      )}
    </div>
  );
}
 
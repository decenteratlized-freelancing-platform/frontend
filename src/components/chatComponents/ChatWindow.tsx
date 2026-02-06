import React, { useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Message {
  senderId: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: number;
  id?: string;
}

interface ChatWindowProps {
  roomId: string;
  currentUser: string;
  messages: Message[];
  onSendMessage: (msg: Message) => void;
  onSendFileMessage: (file: File, fileUrl: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, currentUser, messages, onSendMessage, onSendFileMessage }) => {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("chat:join", roomId);
    // You can add socket listeners here if you want to sync with backend
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const handleSend = (text: string) => {
    const msg = {
      senderId: currentUser,
      text,
      roomId,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    };
    onSendMessage(msg);
    socketRef.current?.emit("chat:message", msg);
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    // Only allow trusted extensions (should match parent logic)
    const allowed = [".pdf", ".docx", ".txt", ".zip"];
    if (!allowed.includes(ext)) {
      alert("File type not allowed. Allowed: " + allowed.join(", "));
      return;
    }
    // Simulate upload and get a local URL (in real app, upload to server)
    const fileUrl = URL.createObjectURL(file);
    onSendFileMessage(file, fileUrl);
    // Optionally, emit to socket here if needed
  };

  const handleFlag = (messageId: string) => {
    const flag = {
      messageId,
      roomId,
      flaggedBy: currentUser,
      reason: "Inappropriate content", // You can make this dynamic
      timestamp: Date.now(),
    };
    socketRef.current?.emit("chat:flag", flag);
    alert("Message flagged for admin review.");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl p-6">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} onFlag={handleFlag} currentUser={currentUser} />
      </div>
      <MessageInput onSend={handleSend} onFileUpload={handleFileUpload} />
    </div>
  );
};

export default ChatWindow; 
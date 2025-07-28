import React from "react";

interface Message {
  senderId: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: number;
  id?: string;
}

interface MessageListProps {
  messages: Message[];
  onFlag: (messageId: string) => void;
  currentUser: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onFlag, currentUser }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {messages.map((msg, idx) => (
        <div key={idx} className={`mb-3 flex flex-col ${msg.senderId === currentUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{msg.senderId}</span>
            {msg.id && (
              <button
                className="text-xs text-[#F87171] hover:underline"
                onClick={() => onFlag(msg.id!)}
              >
                Flag
              </button>
            )}
          </div>
          {msg.text && (
            <div className={`p-3 rounded-2xl shadow text-sm max-w-lg ${msg.senderId === currentUser ? 'bg-[#5C6EFF] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              {msg.text}
            </div>
          )}
          {msg.fileUrl && (
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5C6EFF] underline text-xs mt-1"
            >
              {msg.fileName || 'Download file'}
            </a>
          )}
          <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList; 
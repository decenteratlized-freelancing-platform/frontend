import React, { useRef, useState } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  onFileUpload: (file: File) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onFileUpload }) => {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form className="flex gap-2 p-4 border-t border-gray-100 bg-white rounded-b-2xl" onSubmit={handleSend}>
      <input
        type="text"
        className="flex-1 border border-gray-200 rounded-full p-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5C6EFF]"
        placeholder="Write a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt,.zip"
      />
      <button
        type="button"
        className="bg-gray-100 text-[#5C6EFF] px-3 py-2 rounded-full border border-[#5C6EFF] hover:bg-[#5C6EFF] hover:text-white transition"
        onClick={() => fileInputRef.current?.click()}
        title="Attach file"
      >
        📎
      </button>
      <button type="submit" className="bg-[#5C6EFF] text-white px-5 py-2 rounded-full hover:bg-[#3843b7] transition">
        ➤
      </button>
    </form>
  );
};

export default MessageInput; 
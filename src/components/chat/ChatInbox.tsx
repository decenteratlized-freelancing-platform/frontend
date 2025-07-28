import React from "react";

interface ChatInboxProps {
  rooms: string[];
  onSelectRoom: (roomId: string) => void;
  selectedRoom: string | null;
}

const ChatInbox: React.FC<ChatInboxProps> = ({ rooms, onSelectRoom, selectedRoom }) => {
  return (
    <div className="w-64 border-r border-gray-800 bg-[#1E1E2F] h-full p-4 text-white">
      <h2 className="font-bold mb-4 text-lg text-[#5C6EFF]">Inbox</h2>
      <ul>
        {rooms.map((room) => (
          <li
            key={room}
            className={`p-2 rounded cursor-pointer mb-2 transition-colors ${selectedRoom === room ? 'bg-[#5C6EFF] text-white' : 'hover:bg-[#232346] text-gray-200'}`}
            onClick={() => onSelectRoom(room)}
          >
            {room}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatInbox; 
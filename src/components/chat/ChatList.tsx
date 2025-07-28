import React from "react";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Conversation {
  userId: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

interface ChatListProps {
  users: User[];
  conversations: Record<string, Conversation>;
  onSelect: (userId: string) => void;
  selectedId: string;
  search: string;
  setSearch: (val: string) => void;
}

export default function ChatList({ users, conversations, onSelect, selectedId, search, setSearch }: ChatListProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow border border-gray-100 p-4 w-80 min-w-[320px]">
      {/* Search and Tabs */}
      <div className="mb-4">
        <input
          className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-black"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-4 text-xs font-semibold text-gray-400 mb-2">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-1">All</button>
          <button>Unread</button>
          <button>Groups</button>
        </div>
      </div>
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => {
          const conv = conversations[user.id];
          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer transition border border-transparent ${selectedId === user.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
              onClick={() => onSelect(user.id)}
            >
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  {user.name}
                </div>
                <div className="text-xs text-gray-400 truncate max-w-[180px]">{conv?.lastMessage || "No messages yet"}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400">{conv?.time || ""}</span>
                {conv?.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-2 bg-blue-600 text-white rounded-lg py-2 font-semibold">View More</button>
    </div>
  );
} 
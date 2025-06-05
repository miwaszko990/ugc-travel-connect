import React from 'react';

export default function InboxColumn({ conversations, selectedConversation, onSelect, loading, user }) {
  return (
    <aside className="flex flex-col h-full w-[26%] min-w-0 min-h-0 border-r bg-white">
      <div className="sticky top-0 z-10 bg-white border-b px-6 pt-6 pb-3">
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-[#222]">Messages</h2>
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-full border border-[#ededed] bg-[#f7f7f7] px-4 py-2 text-base text-[#222] focus:outline-none focus:ring-2 focus:ring-[#222] transition mb-2"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4 pt-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#b0b0b0]">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <span className="text-base text-[#717171] mb-1">No messages yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl border border-[#ededed] transition text-left shadow-sm bg-white hover:bg-[#f7f7f7] ${selectedConversation?.id === conv.id ? 'border-[#222] ring-2 ring-[#222]' : ''}`}
                onClick={() => onSelect(conv)}
              >
                <div className="h-11 w-11 rounded-full bg-[#ededed] flex items-center justify-center text-lg font-bold text-[#717171]">
                  {conv.participantInfo?.name?.[0] || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-base truncate text-[#222]">{conv.participantInfo?.name || 'Unknown Creator'}</span>
                    <span className="text-xs text-[#b0b0b0] ml-2 whitespace-nowrap">1d ago</span>
                  </div>
                  <span className="text-sm text-[#717171] truncate block">{conv.lastMessage?.text || 'No messages yet'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
} 
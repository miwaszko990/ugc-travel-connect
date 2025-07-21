import React from 'react';

const mockMessages = [
  { id: 1, text: 'Cześć! Jak mogę pomóc?', sender: 'them', time: '1d ago' },
  { id: 2, text: 'Chciałabym się dowiedzieć czy Państwa dom jest dostępny na sylwestra?', sender: 'me', time: '1d ago' },
  { id: 3, text: 'Tak, jest dostępny!', sender: 'them', time: '1d ago' },
];

export default function ChatColumn({ selectedConversation, user, loading }) {
  const creatorName = selectedConversation?.participantInfo?.name || 'Creator Name';
  const creatorHandle = selectedConversation?.participantInfo?.handle || '@creator';
  return (
    <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-white">
      {/* Sticky Chat Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#ededed] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ededed] flex items-center justify-center text-xl font-bold text-[#717171]" />
          <div>
            <div className="font-extrabold text-lg leading-tight text-[#222]">{creatorName}</div>
            <div className="text-sm text-[#717171]">{creatorHandle}</div>
          </div>
        </div>
        <button className="px-6 py-2 rounded-full bg-[#222222] hover:bg-gray-800 text-white font-bold shadow transition">Request to Book</button>
      </header>
      {/* ChatView - Message Bubbles */}
      <div className="flex-1 overflow-y-auto min-h-0 px-8 py-6 space-y-4 bg-white">
        {selectedConversation ? (
          <div className="flex flex-col gap-3">
            {mockMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow text-base font-medium border border-[#ededed] ${msg.sender === 'me' ? 'bg-white text-[#222] rounded-br-md' : 'bg-[#f0f0f0] text-[#222] rounded-bl-md'}`}>
                  <div>{msg.text}</div>
                  <div className="text-xs text-[#717171] mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[#b0b0b0]">
            <span className="text-lg">Select a conversation to start chatting</span>
          </div>
        )}
      </div>
      {/* ChatInputBar */}
      <footer className="sticky bottom-0 px-8 py-6 border-t border-[#ededed] bg-white flex items-center gap-3 shadow-lg">
        <input type="text" placeholder="Napisz wiadomość..." className="w-full rounded-full border border-[#ededed] bg-[#f7f7f7] px-4 py-2 text-base text-[#222] focus:outline-none focus:ring-2 focus:ring-[#222] transition" />
        <button className="px-6 py-2 rounded-full bg-[#222222] hover:bg-gray-800 text-white font-bold shadow transition">Wyślij</button>
      </footer>
    </main>
  );
} // review trigger

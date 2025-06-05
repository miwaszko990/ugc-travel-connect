import Image from 'next/image';

export default function ChatSidebar({ otherUser }: { otherUser: { id: string; name: string; role: string; profilePic?: string } }) {
  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <div className="relative w-24 h-24">
        <Image
          src={otherUser.profilePic || 'https://via.placeholder.com/96'}
          alt={otherUser.name}
          fill
          className="rounded-full object-cover border-2 border-white shadow"
        />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">{otherUser.name}</h3>
        <p className="text-sm text-gray-500">{otherUser.role === 'brand' ? 'Brand' : 'Creator'}</p>
      </div>
      <div className="w-full mt-6">
        <h4 className="font-medium text-base mb-2">Trip Info</h4>
        <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-600 text-center">
          {/* TODO: Show trip info here */}
          Trip details coming soon.
        </div>
      </div>
    </div>
  );
} 
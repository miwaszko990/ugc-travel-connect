import React from 'react';

export default function ProfileColumn({ profile, onEditProfile, onLogout }) {
  // Placeholder for ProfileCard, StatsDashboard, ActionButtons
  return (
    <aside className="w-[26%] h-full flex flex-col bg-white p-4 border-l border-[#ededed] min-w-0 min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="card shadow-sm bg-white border border-[#ededed]">
          <div className="card-body">
            {/* ProfileCard */}
            <div className="flex flex-col items-center">
              <div className="rounded-full h-20 w-20 bg-[#ededed] mb-4" />
              <h2 className="text-2xl font-black text-[#222] mt-4 mb-1 text-center w-full truncate tracking-tight leading-tight">
                {profile?.brandName || 'Brand Name'}
              </h2>
              <div className="flex items-center text-[#717171] text-sm mb-4">
                <span className="truncate">{profile?.location || 'Location'}</span>
              </div>
              {/* ActionButtons */}
              <div className="flex flex-col gap-2 w-full">
                <button onClick={onEditProfile} className="w-full py-2.5 px-4 bg-[#222222] hover:bg-gray-800 text-white font-bold text-base rounded-full shadow transition">Edit Profile</button>
                <button onClick={onLogout} className="w-full py-2.5 px-4 bg-[#222222] hover:bg-gray-800 text-white font-bold text-base rounded-full shadow transition">Log out</button>
              </div>
            </div>
            <div className="divider" />
            {/* StatsDashboard */}
            <div className="grid grid-cols-2 gap-2">
              <div className="stat bg-[#ededed] rounded-xl">
                <div className="stat-title text-[#717171]">Active Creators</div>
                <div className="stat-value text-lg text-[#222]">{profile?.activeCreators ?? 0}</div>
              </div>
              <div className="stat bg-[#ededed] rounded-xl">
                <div className="stat-title text-[#717171]">Pending</div>
                <div className="stat-value text-lg text-[#222]">{profile?.pendingBookings ?? 0}</div>
              </div>
              <div className="stat bg-[#ededed] rounded-xl">
                <div className="stat-title text-[#717171]">Completed</div>
                <div className="stat-value text-lg text-[#222]">{profile?.completedCampaigns ?? 0}</div>
              </div>
              <div className="stat bg-[#ededed] rounded-xl">
                <div className="stat-title text-[#717171]">Total Spend</div>
                <div className="stat-value text-lg text-[#222]">{profile?.totalSpend ?? '$0'}</div>
              </div>
            </div>
            <button className="btn w-full mt-4 rounded-full bg-[#222222] hover:bg-gray-800 text-white font-bold shadow transition">Browse Creators</button>
          </div>
        </div>
      </div>
    </aside>
  );
} 
import React from 'react';

export default function BrandDashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 bg-[#f8f9fa] min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-10 md:gap-12 items-start">
        {/* Brand Profile Card */}
        <aside className="md:col-span-1 sticky top-8 self-start">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-0 flex flex-col items-center min-w-0">
            <div className="relative h-72 w-full flex items-center justify-center bg-gray-100">
              {/* Placeholder for brand logo */}
              <span className="text-6xl text-gray-300">🏢</span>
            </div>
            <div className="p-6 w-full flex flex-col items-center">
              <h1 className="text-2xl font-black text-gray-900 mb-1 text-center tracking-tight leading-tight">
                Brand Name
              </h1>
              <div className="w-10 border-t border-gray-100 mb-3"></div>
              <div className="mx-auto w-full max-w-[200px] text-left flex flex-col gap-2 mb-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Brand Location</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm truncate">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="h-4 w-4 mr-2 text-blue-400" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5A6.5 6.5 0 1 1 1.5 8 6.5 6.5 0 0 1 8 1.5zm0 2a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 8 3.5z"/></svg>
                  <span>www.brandwebsite.com</span>
                </div>
              </div>
              <button className="w-full py-2.5 px-4 bg-[#222222] hover:bg-gray-800 hover:scale-105 text-white font-bold text-base rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-200 group mt-2">
                Edit Brand Profile
              </button>
            </div>
          </div>
        </aside>
        {/* Main Content (Right Column) */}
        <main className="md:col-span-1 flex flex-col gap-8">
          {/* --- Campaigns Section --- */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#204A38]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
              Active Campaigns
            </h2>
            <div className="text-gray-500">No active campaigns. Start a new campaign to collaborate with creators!</div>
          </div>
          {/* --- Stats Section --- */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#204A38]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" /></svg>
              Brand Stats
            </h2>
            <div className="text-gray-500">Stats and analytics will appear here.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
// review trigger

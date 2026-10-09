import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { AskUniSphereDrawer } from '../assistant/AskUniSphereDrawer';
import { Bell, Sparkles, Menu, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const role = user?.role || 'student';

  // Determine avatar and details matching reference images
  let avatarSrc = '/arjun_round.png';
  let userName = user?.full_name || 'Arjun Kumar';
  let userSub = 'CSE • 3rd Year';

  if (role === 'faculty') {
    avatarSrc = '/faculty_round.png';
    userName = user?.full_name || 'Prof. Priya Sharma';
    userSub = 'CSE Department';
  } else if (role === 'admin') {
    // If on AI Insights page, use female admin avatar from image 9, otherwise male admin from image 8
    avatarSrc = location.pathname.includes('ai-insights') ? '/admin2_round.png' : '/admin_round.png';
    userName = 'Admin';
    userSub = 'System Administrator';
  }

  return (
    <div className="min-h-screen bg-[#EDF5EE] uni-sage-bg flex text-[#0A2818]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col h-full bg-[#EDF5EE] shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-600 hover:text-black rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar matching reference images */}
        <header className="px-5 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10 bg-[#EDF5EE]/80 backdrop-blur-md">
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white border border-[#E2ECE2] text-[#0A4A2B]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-[#0A4A2B]">UniSphere</span>
          </div>

          <div className="hidden md:block">
            {/* Left spacing to balance right user pill */}
          </div>

          {/* Right Header Capsule: Bell + Avatar + User Info + Ask UniSphere */}
          <div className="flex items-center gap-3.5 sm:gap-4 ml-auto">
            {/* Ask UniSphere Assistant Trigger Pill */}
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/80 hover:bg-emerald-200/80 text-[#0B4A2B] border border-emerald-300/60 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Ask UniSphere</span>
              <span className="bg-[#0B4A2B] text-white text-[9px] px-1 py-0.2 rounded font-bold">
                AI
              </span>
            </button>

            {/* Notification Bell matching reference images */}
            <button
              title="Notifications"
              className="p-2 text-[#1E3E2D] hover:text-[#0B4A2B] hover:bg-emerald-100/50 rounded-full transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
            </button>

            {/* User Avatar & Info matching reference images */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-600/20 shadow-xs shrink-0 bg-white">
                <img
                  src={avatarSrc}
                  alt={userName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image loading fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col text-left select-none">
                <span className="text-xs sm:text-sm font-bold text-[#0A2818] leading-tight">
                  {userName}
                </span>
                <span className="text-[11px] text-[#556D5F] font-medium leading-none mt-0.5">
                  {userSub}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 px-4 sm:px-8 pb-8 pt-2 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Ask UniSphere Assistant Drawer */}
      <AskUniSphereDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

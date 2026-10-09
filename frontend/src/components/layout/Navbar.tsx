import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { Badge } from '../common/Badge';
import { LogOut, Sparkles, User, Bell } from 'lucide-react';

interface NavbarProps {
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#DCE5F3] sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-4">
        <Logo size="md" />
        <div className="hidden md:flex items-center text-xs text-slate-400 pl-4 border-l border-slate-200">
          <span className="font-medium text-slate-600">Smart Campus Analytics</span>
          <span className="mx-2">•</span>
          <span>Predict, Optimize & Improve</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Ask UniSphere Assistant Trigger Button */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 text-xs font-semibold shadow-2xs transition-all hover:scale-102 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>Ask UniSphere</span>
          <span className="bg-orange-500 text-white text-[9px] px-1 py-0.2 rounded font-bold">
            AI
          </span>
        </button>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs border border-blue-200">
              {user.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#10213A] leading-tight">
                {user.full_name}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
            </div>
            <Badge label={user.role} variant="role" size="sm" />

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

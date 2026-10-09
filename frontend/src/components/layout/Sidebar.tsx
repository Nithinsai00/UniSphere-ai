import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Briefcase,
  Mail,
  Sparkles,
  MessageSquare,
  User,
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Bot,
  TrendingUp,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';

interface NavLinkItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  // Exact Student items matching reference images 03, 04, 05, 06
  const studentLinks: NavLinkItem[] = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/academics', label: 'Academics', icon: GraduationCap },
    { to: '/student/attendance', label: 'Attendance & LMS', icon: Calendar },
    { to: '/student/placement', label: 'Placements & Skills', icon: Briefcase },
    { to: '/student/inbox', label: 'Inbox', icon: Mail },
    { to: '/student/recommendations', label: 'AI Recommendations', icon: Bot },
    { to: '/student/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/student/profile', label: 'Profile', icon: User },
  ];

  // Exact Faculty items matching reference image 07
  const facultyLinks: NavLinkItem[] = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/students', label: 'Student Management', icon: Users },
    { to: '/faculty/interventions', label: 'Faculty Document', icon: FileText },
    { to: '/faculty/reports', label: 'Replace Analytics', icon: BarChart3 },
  ];

  // Exact Admin items matching reference images 08, 09
  const adminLinks: NavLinkItem[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Staff Directory', icon: Users },
    { to: '/admin/faculty', label: 'Faculty Management', icon: UserCheck },
    { to: '/admin/at-risk', label: 'Class-wise Analytics', icon: BarChart3 },
    { to: '/admin/ai-insights', label: 'AI Insights', icon: Bot },
    { to: '/admin/analytics', label: 'College Analytics', icon: TrendingUp },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/segments', label: 'Feedback', icon: MessageSquare },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const links =
    role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <aside className="w-56 sm:w-60 shrink-0 select-none flex flex-col min-h-screen bg-[#EDF5EE] border-r border-[#E0EBE1] z-20">
      {/* Brand Header: Dark Forest Green Block matching reference images */}
      <div className="bg-[#0B4527] px-5 py-4 rounded-br-2xl shadow-sm flex items-center">
        <Logo size="md" inverted={true} />
      </div>

      {/* Nav List */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <nav className="space-y-1.5 mt-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0B4A2B] text-white shadow-sm'
                      : 'text-[#1E3E2D] hover:bg-emerald-100/60 hover:text-[#0B4A2B]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom subtle actions */}
        <div className="pt-4 border-t border-[#DDE7DF] mt-6 space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

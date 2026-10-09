import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  AlertTriangle,
  UploadCloud,
  Layers,
  LifeBuoy,
  FileText,
  Settings,
  GraduationCap,
  Calendar,
  Briefcase,
  Compass,
  Award,
} from 'lucide-react';

interface NavLinkItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const adminLinks: NavLinkItem[] = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/faculty', label: 'Faculty', icon: UserCheck },
    { to: '/admin/analytics', label: 'Student Analytics', icon: BarChart3 },
    { to: '/admin/at-risk', label: 'At-Risk Students', icon: AlertTriangle, badge: 'Triage' },
    { to: '/admin/data-integration', label: 'Data Integration', icon: UploadCloud },
    { to: '/admin/segments', label: 'Student Segments', icon: Layers },
    { to: '/admin/interventions', label: 'Interventions', icon: LifeBuoy },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const facultyLinks: NavLinkItem[] = [
    { to: '/faculty/dashboard', label: 'Faculty Overview', icon: LayoutDashboard },
    { to: '/faculty/students', label: 'Assigned Students', icon: Users },
    { to: '/faculty/interventions', label: 'Mentoring Cases', icon: LifeBuoy },
    { to: '/faculty/reports', label: 'Department Reports', icon: FileText },
  ];

  const studentLinks: NavLinkItem[] = [
    { to: '/student/dashboard', label: 'My Success Hub', icon: LayoutDashboard },
    { to: '/student/profile', label: 'Student Profile', icon: GraduationCap },
    { to: '/student/academics', label: 'Academics & CGPA', icon: Award },
    { to: '/student/attendance', label: 'Attendance Monitor', icon: Calendar },
    { to: '/student/placement', label: 'Placement Readiness', icon: Briefcase },
    { to: '/student/recommendations', label: 'Your Next Steps', icon: Compass, badge: 'AI Action' },
  ];

  const links =
    role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-[#DCE5F3] flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      <div className="p-3">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role === 'admin' ? 'Administration' : role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
        </div>

        <nav className="space-y-1 mt-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#245BB5] font-semibold border-l-4 border-[#245BB5] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-800" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Campus Notice Card at bottom */}
      <div className="mt-auto p-3 m-3 rounded-xl bg-gradient-to-br from-blue-50/50 to-orange-50/30 border border-blue-100 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#102B57] mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Status: Online</span>
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          Predictive algorithms active. Institutional records in sync.
        </p>
      </div>
    </aside>
  );
};

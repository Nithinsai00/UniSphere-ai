import React from 'react';
import { Mail, Bell, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentInbox: React.FC = () => {
  const navigate = useNavigate();

  const messages = [
    {
      id: 1,
      sender: 'Prof. Priya Sharma',
      role: 'CSE Faculty Mentor',
      subject: 'Scheduled Mentoring Session — Operating Systems',
      time: 'Today, 11:30 AM',
      unread: true,
      preview: 'Please bring your mid-semester internal assessment answer script for review.',
      badge: 'Mentoring',
      badgeColor: 'bg-emerald-100 text-[#05603A]',
    },
    {
      id: 2,
      sender: 'Training & Placement Cell',
      role: 'T&P Officer',
      subject: 'Mock Technical Interview Slot Confirmed',
      time: 'Yesterday, 4:15 PM',
      unread: true,
      preview: 'Your 1-on-1 coding interview preparation round is scheduled for Friday 2:00 PM.',
      badge: 'Placement',
      badgeColor: 'bg-sky-100 text-sky-700',
    },
    {
      id: 3,
      sender: 'Academic Administration',
      role: 'Dean of Academics',
      subject: 'Semester Continuous Evaluation (CIE-2) Timetable',
      time: '2 days ago',
      unread: true,
      preview: 'The upcoming CIE-2 schedule has been uploaded to the university portal.',
      badge: 'Academics',
      badgeColor: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Student Inbox
        </h1>
        <p className="text-xs sm:text-sm text-[#446552] font-medium mt-0.5">
          Official academic notices, mentoring follow-ups, and placement invitations
        </p>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="uni-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B4A2B] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0A2818]">{msg.sender}</span>
                  <span className="text-[11px] text-slate-400">• {msg.role}</span>
                  {msg.unread && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      New
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-[#0A2818] mt-1">{msg.subject}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{msg.preview}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 font-medium">{msg.time}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${msg.badgeColor}`}>
                {msg.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

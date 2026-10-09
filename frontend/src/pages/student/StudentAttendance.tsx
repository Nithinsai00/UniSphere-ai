import React from 'react';
import {
  LogIn,
  CheckSquare,
  Calendar,
  Clock,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  // Exact numbers matching 05_attendance_lms.png
  const overallAttendance = 82;

  const subjectAttendance = [
    { subject: 'Data Structures', percent: 88 },
    { subject: 'DBMS', percent: 80 },
    { subject: 'Operating Systems', percent: 72 },
    { subject: 'CN', percent: 85 },
    { subject: 'SE', percent: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Title matching 05_attendance_lms.png */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Attendance Overview
        </h1>
      </div>

      {/* Top Row: Overall Attendance Donut + Subject-wise Attendance Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Overall Attendance Donut Gauge (5 cols) */}
        <div className="md:col-span-5 uni-card p-6 flex flex-col items-center justify-between text-center">
          <h2 className="text-lg font-bold text-[#0A2818] self-start">Overall Attendance</h2>

          <div className="relative w-40 h-40 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#D1FADF"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#15803D"
                strokeWidth="12"
                strokeDasharray={`${(overallAttendance / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#0A2818] tracking-tight">
                {overallAttendance}%
              </span>
            </div>
          </div>

          <div className="text-sm font-bold text-[#0A2818]">Good</div>
        </div>

        {/* Card 2: Subject-wise Attendance Progress Bars (7 cols) */}
        <div className="md:col-span-7 uni-card p-6">
          <h2 className="text-lg font-bold text-[#0A2818] mb-5">Subject-wise Attendance</h2>
          <div className="space-y-4">
            {subjectAttendance.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#0A2818]">{item.subject}</span>
                  <span className="font-bold text-[#0A2818]">{item.percent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#E5EFE6] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#15803D] transition-all duration-500 ease-out"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Card: LMS Activity matching 05_attendance_lms.png */}
      <div className="uni-card p-6">
        <h2 className="text-lg font-bold text-[#0A2818] mb-4">LMS Activity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Metric 1: Logins */}
          <div className="p-4 rounded-xl border border-[#E2ECE2] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#52665A]">Logins</span>
              <div className="text-2xl font-bold text-[#0A2818] mt-0.5">45</div>
              <span className="text-[11px] text-[#52665A]">Last 30 days</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-[#15803D] flex items-center justify-center">
              <LogIn className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          {/* Metric 2: Assignments */}
          <div className="p-4 rounded-xl border border-[#E2ECE2] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#52665A]">Assignments</span>
              <div className="text-2xl font-bold text-[#0A2818] mt-0.5">8/10</div>
              <span className="text-[11px] text-[#52665A]">Completed</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-[#15803D] flex items-center justify-center">
              <CheckSquare className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          {/* Metric 3: Upcoming Deadlines (Red 2) */}
          <div className="p-4 rounded-xl border border-[#E2ECE2] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#52665A]">Upcoming Deadlines</span>
              <div className="text-2xl font-bold text-[#DC2626] mt-0.5">2</div>
              <span className="text-[11px] text-[#52665A]">This week</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          {/* Metric 4: Last Login (Red Today) */}
          <div className="p-4 rounded-xl border border-[#E2ECE2] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#52665A]">Last Login</span>
              <div className="text-2xl font-bold text-[#DC2626] mt-0.5">Today</div>
              <span className="text-[11px] text-[#52665A]">2:30 PM</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

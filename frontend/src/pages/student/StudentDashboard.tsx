import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Calendar,
  Monitor,
  GraduationCap,
  Star,
  Heart,
  Mail,
  Clock,
  Briefcase,
  BookOpen,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Map values from API or use exact reference defaults
  const student = data?.student || {
    full_name: 'Arjun Kumar',
    department: 'CSE',
    current_year: 3,
    student_id: 'STU001',
    email: 'arjun@gmail.com',
    phone: '+91 98765 43210',
  };

  const successScore = data?.success_score?.overall !== undefined ? Math.round(data.success_score.overall) : 78;
  const attendanceRate = data?.attendance?.overall_attendance !== undefined ? Math.round(data.attendance.overall_attendance) : 82;
  const cgpaValue = data?.academic?.cgpa !== undefined ? Number(data.academic.cgpa).toFixed(1) : '8.1';
  const backlogsCount = data?.academic?.backlog_count !== undefined ? data.academic.backlog_count : 0;
  const placementRate = data?.placement?.readiness_score !== undefined ? Math.round(data.placement.readiness_score) : 72;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle matching 03_student_dashboard.png */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Welcome Back, {student.full_name.split(' ')[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-[#446552] font-medium mt-0.5">
          Keep learning, keep growing!
        </p>
      </div>

      {/* Top 3 Cards in a Row matching 03_student_dashboard.png */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Student Profile Card */}
        <div className="uni-card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-xs mb-3 bg-white">
            <img
              src="/arjun_round.png"
              alt={student.full_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/photos/03_student_dashboard.png';
              }}
            />
          </div>

          <h2 className="text-lg font-bold text-[#0A2818]">{student.full_name}</h2>
          <p className="text-xs text-[#52665A] font-medium mt-0.5">
            {student.department} - {student.current_year}rd Year
          </p>
          <p className="text-xs text-[#52665A] font-medium mb-4">
            Roll No: {student.student_id}
          </p>

          <div className="w-full border-t border-[#EAEFEA] pt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#4B6354]">
              <span>10th Marks</span>
              <span className="font-bold text-[#0A2818]">95%</span>
            </div>
            <div className="flex justify-between items-center text-[#4B6354]">
              <span>12th Marks</span>
              <span className="font-bold text-[#0A2818]">92%</span>
            </div>
            <div className="flex justify-between items-center text-[#4B6354]">
              <span>Email</span>
              <span className="font-semibold text-[#0A2818]">{student.email}</span>
            </div>
            <div className="flex justify-between items-center text-[#4B6354]">
              <span>Phone</span>
              <span className="font-semibold text-[#0A2818]">{student.phone || '+91 98765 43210'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Student Success Score Donut Gauge matching 03_student_dashboard.png */}
        <div className="uni-card p-6 flex flex-col items-center justify-between text-center">
          <h3 className="text-base font-bold text-[#0A2818]">Student Success Score</h3>

          {/* SVG Circular Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background light track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#D1FADF"
                strokeWidth="12"
              />
              {/* Progress Green Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#15803D"
                strokeWidth="12"
                strokeDasharray={`${(successScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#0A2818] tracking-tight">
                {successScore}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-bold text-[#0B4A2B]">Good Performance</h4>
            <p className="text-xs text-[#52665A] mt-0.5">
              Keep it up! You're on the right track.
            </p>
          </div>
        </div>

        {/* Card 3: Overall Status matching 03_student_dashboard.png */}
        <div className="uni-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A2818] mb-3">Overall Status</h3>
            {/* On Track Pill matching image */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D1FADF] text-[#05603A] font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>On Track</span>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#4B6354] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0B4A2B]" />
                <span>Attendance</span>
              </span>
              <span className="font-bold text-[#0A2818]">{attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#4B6354] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0B4A2B]" />
                <span>CGPA</span>
              </span>
              <span className="font-bold text-[#0A2818]">{cgpaValue}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#4B6354] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0B4A2B]" />
                <span>Backlogs</span>
              </span>
              <span className="font-bold text-[#0A2818]">{backlogsCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#4B6354] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#0B4A2B]" />
                <span>Placement Readiness</span>
              </span>
              <span className="font-bold text-[#0A2818]">{placementRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: 6 Metric Stat Cards matching 03_student_dashboard.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Attendance */}
        <div 
          onClick={() => navigate('/student/attendance')}
          className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">Attendance</span>
          <div className="text-xl font-bold text-[#0A2818] mt-0.5">{attendanceRate}%</div>
          <span className="text-[11px] text-[#52665A] mt-0.5">84 Subjects</span>
        </div>

        {/* Metric 2: LMS Activity */}
        <div 
          onClick={() => navigate('/student/attendance')}
          className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <Monitor className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">LMS Activity</span>
          <div className="text-xl font-bold text-[#0A2818] mt-0.5">75%</div>
          <span className="text-[11px] text-[#52665A] mt-0.5">Assignments</span>
        </div>

        {/* Metric 3: CGPA */}
        <div 
          onClick={() => navigate('/student/academics')}
          className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">CGPA</span>
          <div className="text-xl font-bold text-[#0A2818] mt-0.5">{cgpaValue}</div>
          <span className="text-[11px] text-[#52665A] mt-0.5">Out of 10</span>
        </div>

        {/* Metric 4: Skills Score */}
        <div 
          onClick={() => navigate('/student/placement')}
          className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <Star className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">Skills Score</span>
          <div className="text-xl font-bold text-[#0A2818] mt-0.5">70%</div>
          <span className="text-[11px] text-[#52665A] mt-0.5">Coding + Aptitude</span>
        </div>

        {/* Metric 5: Placement Ready */}
        <div 
          onClick={() => navigate('/student/placement')}
          className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">Placement Ready</span>
          <div className="text-xl font-bold text-[#0A2818] mt-0.5">{placementRate}%</div>
          <span className="text-[11px] text-[#52665A] mt-0.5">T & P</span>
        </div>

        {/* Metric 6: Inbox (with 3 New in Red) */}
        <div className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">Inbox</span>
          <div className="text-xl font-bold text-[#DC2626] mt-0.5">3</div>
          <span className="text-[11px] text-[#DC2626] font-semibold mt-0.5">New</span>
        </div>
      </div>
    </div>
  );
};

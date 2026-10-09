import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken } from '../../services/api';
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
  FileText,
  CheckCircle2,
  Download,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashRes, assignRes, taskRes, matRes] = await Promise.allSettled([
          api.getStudentDashboard(),
          api.getStudentAssignments(),
          api.getStudentTasks(),
          api.getStudentStudyMaterials(),
        ]);

        if (dashRes.status === 'fulfilled') setData(dashRes.value);
        if (assignRes.status === 'fulfilled') setAssignments(assignRes.value || []);
        if (taskRes.status === 'fulfilled') setTasks(taskRes.value || []);
        if (matRes.status === 'fulfilled') setMaterials(matRes.value || []);
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleToggleTask = async (taskId: number) => {
    try {
      const res = await api.toggleStudentTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: res.status, is_completed: res.is_completed } : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDownloadMaterial = async (mat: any) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/student/study-materials/${mat.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mat.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Unable to download study resource.');
    }
  };

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
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Welcome Back, {student.full_name.split(' ')[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-[#446552] font-medium mt-0.5">
          Keep learning, keep growing!
        </p>
      </div>

      {/* Top 3 Cards in a Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Student Profile Card */}
        <div className="uni-card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-xs mb-3 bg-white">
            <img
              src="/arjun_round.png"
              alt={student.full_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/unisphere-logo.png';
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

        {/* Card 2: Student Success Score Donut Gauge */}
        <div className="uni-card p-6 flex flex-col items-center justify-between text-center">
          <h3 className="text-base font-bold text-[#0A2818]">Student Success Score</h3>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
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

        {/* Card 3: Overall Status */}
        <div className="uni-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A2818] mb-3">Overall Status</h3>
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

      {/* Bottom Row: 6 Metric Stat Cards */}
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
        <div 
          onClick={() => navigate('/student/inbox')}
          className="uni-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center mb-2">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#52665A]">Inbox</span>
          <div className="text-xl font-bold text-[#DC2626] mt-0.5">3</div>
          <span className="text-[11px] text-[#DC2626] font-semibold mt-0.5">New</span>
        </div>
      </div>

      {/* Grid: Assignments & Faculty Improvement Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Class Assignments */}
        <div className="uni-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAEFEA]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B4A2B]" />
              <h2 className="text-sm font-bold text-[#0A2818]">Class Assignments & Deadlines</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {assignments.length} Active
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No active assignments due.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#CFE1D4] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#0A2818] line-clamp-1">{a.title}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                      Due: {a.due_date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="font-medium text-emerald-800">{a.subject}</span>
                    <span>{a.submissions_count} submitted</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Faculty-Assigned Improvement Tasks */}
        <div className="uni-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAEFEA]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B4A2B]" />
              <h2 className="text-sm font-bold text-[#0A2818]">Targeted Improvement Tasks</h2>
            </div>
            <span className="text-[11px] text-[#0B4A2B] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              Faculty Assigned
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No pending improvement tasks.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    t.is_completed
                      ? 'bg-emerald-50/40 border-emerald-200/60 opacity-80'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={t.is_completed}
                        onChange={() => handleToggleTask(t.id)}
                        className="w-4 h-4 text-[#0B4A2B] rounded-sm focus:ring-[#0B4A2B] cursor-pointer"
                      />
                      <h3
                        className={`text-xs font-bold text-[#0A2818] ${
                          t.is_completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {t.title}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.is_completed
                          ? 'bg-emerald-100 text-[#0B4A2B]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {t.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pl-6 pt-1">
                    <span className="font-semibold text-slate-600">{t.subject}</span>
                    <span>Due: {t.due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Recent Study Materials */}
      <div className="uni-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAEFEA]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0B4A2B]" />
            <h2 className="text-sm font-bold text-[#0A2818]">Recent Study Materials & Notes</h2>
          </div>
          <button
            onClick={() => navigate('/student/study-materials')}
            className="text-xs font-semibold text-[#0B4A2B] hover:text-[#07361F] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Materials</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No published study materials available currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#CFE1D4] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                    <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-[#0B4A2B] font-bold uppercase">
                      {m.file_type}
                    </span>
                    <span>{m.file_size}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#0A2818] line-clamp-1">{m.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.subject}</p>
                </div>
                <button
                  onClick={() => handleDownloadMaterial(m)}
                  className="w-full py-2 px-3 rounded-lg bg-[#EDF5EE] hover:bg-[#0B4A2B] hover:text-white text-[#0B4A2B] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

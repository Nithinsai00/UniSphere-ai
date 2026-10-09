import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  Award,
  Calendar,
  Briefcase,
  BookOpen,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LifeBuoy,
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

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">Loading your student success hub...</span>
      </div>
    );
  }

  const { student, success_score, academic, attendance, lms, placement, next_steps, assigned_support_programs } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="uni-card p-6 bg-gradient-to-r from-[#102B57] via-[#1a3d75] to-[#245BB5] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-orange-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {student.full_name}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{student.full_name}</h1>
          <p className="text-xs text-blue-200 mt-1">
            {student.department} • {student.degree} (Year {student.current_year}, Semester {student.semester}) • Roll: {student.student_id}
          </p>
        </div>

        {/* Success Score Badge */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right shrink-0 min-w-[160px]">
          <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider block">
            Student Success Score
          </span>
          <div className="text-3xl font-black text-white mt-0.5">
            {success_score.overall !== null ? success_score.overall : '—'}
            <span className="text-xs text-blue-200 font-normal"> / 100</span>
          </div>
          {success_score.is_provisional && (
            <span className="text-[10px] text-amber-200 block mt-1">
              Provisional (Junior Year)
            </span>
          )}
        </div>
      </div>

      {/* 4 Pillars Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Academics */}
        <div
          onClick={() => navigate('/student/academics')}
          className="uni-card p-4 hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Academics</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-[#10213A] mt-1">{academic.cgpa ? `${academic.cgpa} CGPA` : '—'}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{academic.status}</span>
        </div>

        {/* Attendance */}
        <div
          onClick={() => navigate('/student/attendance')}
          className="uni-card p-4 hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-[#10213A] mt-1">
            {attendance.overall_attendance ? `${attendance.overall_attendance}%` : '—'}
          </div>
          <span
            className={`text-[11px] font-semibold mt-0.5 block ${
              (attendance.overall_attendance || 0) < 75 ? 'text-amber-600' : 'text-emerald-700'
            }`}
          >
            {attendance.status}
          </span>
        </div>

        {/* LMS Activity */}
        <div className="uni-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">LMS Coursework</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-[#10213A] mt-1">
            {lms.assignment_completion_rate ? `${lms.assignment_completion_rate}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Assignment Completion</span>
        </div>

        {/* Placement Readiness */}
        <div
          onClick={() => navigate('/student/placement')}
          className="uni-card p-4 hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Placement Readiness</span>
            <Briefcase className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-[#10213A] mt-1">
            {placement.assessed ? `${success_score.placement}/100` : 'Not Assessed Yet'}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {placement.coding_score ? `Coding: ${placement.coding_score}/100` : 'Curriculum in progress'}
          </span>
        </div>
      </div>

      {/* Your Next Steps Section (Supportive Recommendations) */}
      <div className="uni-card p-6 border-l-4 border-l-[#F58B35] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#F58B35]" />
            <div>
              <h2 className="text-base font-bold text-[#10213A]">Your Next Steps</h2>
              <p className="text-xs text-slate-500">
                Personalized recommendations designed to elevate your potential
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/recommendations')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            All Action Steps →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {next_steps && next_steps.length > 0 ? (
            next_steps.slice(0, 4).map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-200 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#10213A]">{rec.title}</span>
                  <Badge label={rec.priority} variant="priority" size="sm" />
                </div>
                <p className="text-slate-500 text-[11px]">{rec.reason}</p>
                <div className="p-2 rounded bg-blue-50 text-blue-900 font-medium text-[11px]">
                  👉 {rec.action}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
              You are doing wonderfully across all semester milestones! Keep up the great focus.
            </div>
          )}
        </div>
      </div>

      {/* Assigned Mentoring / Support Programs */}
      {assigned_support_programs && assigned_support_programs.length > 0 && (
        <div className="uni-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-blue-600" />
            <span>Assigned Faculty Support Programs</span>
          </h3>

          <div className="space-y-2">
            {assigned_support_programs.map((p: any) => (
              <div
                key={p.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{p.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Faculty Coordinator: {p.faculty_name}
                  </p>
                </div>
                <Badge label={p.status} variant="status" size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

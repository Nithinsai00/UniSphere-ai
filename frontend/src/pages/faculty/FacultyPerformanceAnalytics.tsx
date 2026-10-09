import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Filter,
  Loader2,
  Users,
} from 'lucide-react';

export const FacultyPerformanceAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getFacultyPerformanceAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
        <span>Loading departmental performance analytics...</span>
      </div>
    );
  }

  const subjects = data?.subjects || [];
  const filteredSubjects = selectedSubject === 'all'
    ? subjects
    : subjects.filter((s: any) => s.code === selectedSubject || s.name === selectedSubject);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#446552] font-semibold mt-0.5">
            Subject averages, attendance trends, and academic benchmark tracking for {data?.department || 'Computer Science & Engineering'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-xl font-semibold text-slate-700"
          >
            <option value="all">All Course Subjects</option>
            {subjects.map((s: any) => (
              <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weak-Subject Identification Banner */}
      {data?.weak_subjects && data.weak_subjects.length > 0 && (
        <div className="uni-card p-5 border-amber-200 bg-amber-50/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Targeted Academic Improvement Focus: {data.weak_subjects[0].subject}</span>
          </div>
          <p className="text-xs text-[#52665A] leading-relaxed">
            Class average is <span className="font-bold text-amber-900">{data.weak_subjects[0].class_average}</span> with{' '}
            <span className="font-bold text-amber-900">{data.weak_subjects[0].students_below_benchmark} students</span> below the 75% benchmark threshold.
          </p>
          <p className="text-xs font-semibold text-[#0B4A2B] bg-white p-2.5 rounded-xl border border-amber-200">
            Suggested Improvement: {data.weak_subjects[0].suggested_actions}
          </p>
        </div>
      )}

      {/* Subject-Wise Analytics Cards */}
      <div>
        <h2 className="text-base font-bold text-[#082F1B] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Subject-Wise Performance Metrics</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((sub: any) => (
            <div key={sub.code} className="uni-card p-5 space-y-4 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{sub.code}</span>
                  <h3 className="text-base font-bold text-[#0A2818]">{sub.name}</h3>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    sub.status === 'Weak Subject'
                      ? 'bg-amber-100 text-amber-800'
                      : sub.status === 'Strong'
                      ? 'bg-emerald-100 text-[#05603A]'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Class Average</span>
                  <span className="font-extrabold text-[#0A2818]">{sub.avg_marks}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.avg_marks >= 80 ? 'bg-[#10B981]' : sub.avg_marks >= 70 ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'
                    }`}
                    style={{ width: `${sub.avg_marks}%` }}
                  />
                </div>
              </div>

              {/* Metric stats grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Highest</span>
                  <span className="text-xs font-extrabold text-slate-800">{sub.highest_marks}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Lowest</span>
                  <span className="text-xs font-extrabold text-slate-800">{sub.lowest_marks}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Pass Rate</span>
                  <span className="text-xs font-extrabold text-[#15803D]">{sub.pass_percentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Support Req.</span>
                  <span className="text-xs font-extrabold text-[#DC2626]">{sub.needs_improvement_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Trends Over Time */}
      <div className="uni-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-[#082F1B]">Class Attendance Progression Trends</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800">
            Benchmark: 75% Mandatory Threshold
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {data?.attendance_trends?.map((item: any) => (
            <div key={item.period} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">{item.period}</span>
              <div className="text-lg font-black text-[#0A2818]">{item.attendance}%</div>
              <span className="inline-block text-[10px] font-bold text-[#15803D]">
                Optimal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

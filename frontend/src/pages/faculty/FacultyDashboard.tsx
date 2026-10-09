import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  AlertTriangle,
  LifeBuoy,
  Award,
  Calendar,
  Briefcase,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">Loading faculty portal metrics...</span>
      </div>
    );
  }

  const { faculty_info } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="uni-card p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">
            Faculty Mentoring Command Center
          </span>
          <h1 className="text-2xl font-black mt-1">{faculty_info?.name}</h1>
          <p className="text-xs text-blue-200 mt-0.5">
            {faculty_info?.designation} • {faculty_info?.department} • Assigned Classes:{' '}
            {faculty_info?.assigned_classes || 'All Department Classes'}
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Students"
          value={data.total_assigned}
          subtitle={`In ${faculty_info?.department}`}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          onClick={() => navigate('/faculty/students')}
        />
        <MetricCard
          title="Department Success Score"
          value={`${data.average_success_score}/100`}
          subtitle="Cohort average"
          icon={<Award className="w-4 h-4 text-[#F58B35]" />}
          trend={{ direction: 'up', text: 'Benchmark 65+' }}
        />
        <MetricCard
          title="Academic Risk Flags"
          value={data.academic_risk_count}
          subtitle="CGPA or attendance short"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          variant="warning"
          onClick={() => navigate('/faculty/students?risk=High')}
        />
        <MetricCard
          title="Open Interventions"
          value={data.my_open_interventions_count}
          subtitle="Mentoring cases in progress"
          icon={<LifeBuoy className="w-4 h-4 text-emerald-600" />}
          onClick={() => navigate('/faculty/interventions')}
        />
      </div>

      {/* Immediate Attention: Priority Students Queue */}
      <div className="uni-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Priority Students Requiring Academic Follow-Up</span>
            </h3>
            <p className="text-xs text-slate-500">
              Students in your department with critical multi-factor risk breaches
            </p>
          </div>
          <button
            onClick={() => navigate('/faculty/students')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Department Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Year / Sem</th>
                <th className="py-2.5 px-3">Success Score</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">CGPA / Backlogs</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.priority_students && data.priority_students.length > 0 ? (
                data.priority_students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#10213A]">{s.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      Year {s.current_year} (Sem {s.semester})
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">{s.success_score}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          (s.overall_attendance || 0) < 65
                            ? 'text-red-600'
                            : (s.overall_attendance || 0) < 75
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {s.overall_attendance ? `${s.overall_attendance}%` : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{s.cgpa ? `${s.cgpa} CGPA` : '—'}</div>
                      <div className="text-[10px] text-red-600">
                        {s.backlog_count > 0 ? `${s.backlog_count} Backlog(s)` : '0 Backlogs'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge label={s.combined_risk} variant="risk" size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/faculty/students/${s.id}`)}
                        className="px-2.5 py-1 bg-[#245BB5] text-white hover:bg-[#102B57] rounded text-xs font-semibold transition-colors shadow-2xs"
                      >
                        Inspect & Intervene
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No critical risk students in your department at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

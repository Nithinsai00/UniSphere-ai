import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  UserCheck,
  Building2,
  Award,
  AlertTriangle,
  Briefcase,
  LifeBuoy,
  TrendingUp,
  Filter,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

const COLORS = ['#102B57', '#245BB5', '#3B82F6', '#F58B35', '#16A34A', '#DC2626'];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');

  const [stats, setStats] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [deptRiskData, setDeptRiskData] = useState<any[]>([]);
  const [placementDeptData, setPlacementDeptData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [quadrantData, setQuadrantData] = useState<any[]>([]);
  const [priorityStudents, setPriorityStudents] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        dashStats,
        overview,
        deptRisks,
        placementDepts,
        attendance,
        quadrant,
        studentList,
      ] = await Promise.all([
        api.getDashboardStats(),
        api.getAnalyticsOverview(selectedDept),
        api.getRiskByDepartment(),
        api.getPlacementByDepartment(),
        api.getAttendanceTrends(),
        api.getAcademicVsPlacement(selectedDept),
        api.getStudents({ risk_level: 'High', limit: 6 }),
      ]);

      setStats(dashStats);
      setOverviewData(overview);
      setDeptRiskData(deptRisks);
      setPlacementDeptData(placementDepts);
      setAttendanceData(attendance);
      setQuadrantData(quadrant);
      setPriorityStudents(studentList.students || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-3 font-medium">
          Computing campus-wide success intelligence...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Department Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Institutional Success Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics across academic, placement, attendance, and LMS vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#DCE5F3] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Eng</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication Engineering">Electronics & Comm</option>
              <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title="Refresh Metrics"
            className="p-2 bg-white border border-[#DCE5F3] rounded-lg text-slate-600 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={stats?.total_students || 0}
          subtitle="Enrolled cohort"
          icon={<Users className="w-4 h-4 text-blue-600" />}
          onClick={() => navigate('/admin/students')}
        />
        <MetricCard
          title="Total Faculty"
          value={stats?.total_faculty || 0}
          subtitle="Active mentors"
          icon={<UserCheck className="w-4 h-4 text-indigo-600" />}
          onClick={() => navigate('/admin/faculty')}
        />
        <MetricCard
          title="Departments"
          value={stats?.departments_count || 0}
          subtitle="Campus branches"
          icon={<Building2 className="w-4 h-4 text-slate-600" />}
        />
        <MetricCard
          title="Avg Success Score"
          value={`${stats?.average_success_score || 0}/100`}
          subtitle="Campus weighted index"
          icon={<Award className="w-4 h-4 text-[#F58B35]" />}
          trend={{ direction: 'up', text: 'Benchmark 65+' }}
          onClick={() => navigate('/admin/analytics')}
        />

        <MetricCard
          title="Academic Risk"
          value={stats?.academic_risk_count || 0}
          subtitle="CGPA / attendance deficit"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          variant="warning"
          onClick={() => navigate('/admin/at-risk?type=academic')}
        />
        <MetricCard
          title="Placement Risk"
          value={stats?.placement_risk_count || 0}
          subtitle="Coding / aptitude deficit"
          icon={<Briefcase className="w-4 h-4 text-blue-600" />}
          variant="primary"
          onClick={() => navigate('/admin/at-risk?type=placement')}
        />
        <MetricCard
          title="Combined Risk"
          value={stats?.combined_risk_count || 0}
          subtitle="Critical dual flags"
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          variant="danger"
          onClick={() => navigate('/admin/at-risk')}
        />
        <MetricCard
          title="Open Interventions"
          value={stats?.open_interventions || 0}
          subtitle="Active mentoring cases"
          icon={<LifeBuoy className="w-4 h-4 text-emerald-600" />}
          onClick={() => navigate('/admin/interventions')}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Score Distribution */}
        <div className="uni-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#10213A]">
                Student Success Score Distribution
              </h3>
              <p className="text-xs text-slate-500">Distribution across 5 institutional tiers</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              0 - 100 Scale
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData?.score_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#245BB5" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic vs Placement Risk by Department */}
        <div className="uni-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#10213A]">
                High-Risk Distribution by Department
              </h3>
              <p className="text-xs text-slate-500">Comparing academic vs placement risk rates</p>
            </div>
            <button
              onClick={() => navigate('/admin/at-risk')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRiskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="academic_high_risk"
                  fill="#DC2626"
                  name="Academic High Risk"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="placement_high_risk"
                  fill="#F58B35"
                  name="Placement High Risk"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Attendance Brackets + Academic vs Placement Quadrant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown */}
        <div className="uni-card p-5">
          <h3 className="text-sm font-bold text-[#10213A] mb-1">Attendance Trends</h3>
          <p className="text-xs text-slate-500 mb-4">Threshold benchmark: 75.0%</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  dataKey="count"
                  nameKey="bracket"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {attendanceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {attendanceData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span>{item.bracket}</span>
                </div>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic vs Placement Quadrant */}
        <div className="uni-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#10213A]">
                Academic vs Placement Readiness Quadrant
              </h3>
              <p className="text-xs text-slate-500">
                Correlation between academic score (X) and placement readiness (Y)
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/segments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Segmentation Details →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  dataKey="academic_score"
                  name="Academic Score"
                  domain={[0, 100]}
                  unit=" pts"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="placement_score"
                  name="Placement Score"
                  domain={[0, 100]}
                  unit=" pts"
                  tick={{ fontSize: 11 }}
                />
                <ZAxis range={[25, 25]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 border border-slate-200 rounded-lg shadow-md text-xs">
                          <p className="font-bold text-slate-900">{data.name} ({data.student_id})</p>
                          <p className="text-slate-500">{data.department}</p>
                          <p className="text-blue-600 mt-1">Academic: {data.academic_score}</p>
                          <p className="text-orange-600">Placement: {data.placement_score}</p>
                          <p className="text-slate-600 font-medium">Segment: {data.segment}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={quadrantData} fill="#245BB5" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority At-Risk Intervention Queue */}
      <div className="uni-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Immediate Attention: High Combined Risk Students</span>
            </h3>
            <p className="text-xs text-slate-500">
              Students breaching critical multi-dimensional institutional thresholds
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/at-risk')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Open At-Risk Triage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Success Score</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">CGPA / Backlogs</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#10213A]">{s.full_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{s.department}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">{s.success_score}</span>
                    <span className="text-slate-400 text-[10px]"> / 100</span>
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
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

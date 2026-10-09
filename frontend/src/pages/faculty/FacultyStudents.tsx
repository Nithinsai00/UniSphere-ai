import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Search, Eye, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export const FacultyStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [departmentName, setDepartmentName] = useState('');
  const [search, setSearch] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [riskLevel, setRiskLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyStudents({
        search,
        current_year: currentYear ? parseInt(currentYear) : undefined,
        risk_level: riskLevel !== 'all' ? riskLevel : undefined,
        page,
        limit: 15,
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
      setDepartmentName(res.department || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, currentYear, riskLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Department Students: {departmentName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total active cohort: {total} students in your departmental jurisdiction
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="uni-card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or name..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-[#DCE5F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={currentYear}
            onChange={(e) => {
              setCurrentYear(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => {
              setRiskLevel(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <button
            type="submit"
            className="px-3 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Apply Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="uni-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Year / Sem</th>
                <th className="py-3 px-4">Success Score</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">CGPA / Backlogs</th>
                <th className="py-3 px-4">Placement Score</th>
                <th className="py-3 px-4">Risk Flag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading department roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No students matching search criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#10213A]">{s.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      Year {s.current_year} (Sem {s.semester})
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900">{s.success_score}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          (s.overall_attendance || 0) < 75 ? 'text-amber-600' : 'text-emerald-700'
                        }`}
                      >
                        {s.overall_attendance ? `${s.overall_attendance}%` : 'Unassessed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.cgpa ? `${s.cgpa} CGPA` : '—'}</div>
                      <div
                        className={`text-[10px] ${
                          s.backlog_count > 0 ? 'text-red-600 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {s.backlog_count > 0 ? `${s.backlog_count} Backlog(s)` : '0 Backlogs'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {s.placement_score !== null ? (
                        <span className="font-bold text-slate-800">{s.placement_score}/100</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassessed</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={s.combined_risk} variant="risk" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/faculty/students/${s.id}`)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Open Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(page - 1) * 15 + 1} - {Math.min(page * 15, total)} of {total} records
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

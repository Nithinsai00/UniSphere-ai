import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [currentYear, setCurrentYear] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState('all');
  const [sortBy, setSortBy] = useState('success_score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Form State for Add Student
  const [formData, setFormData] = useState<any>({
    student_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    academic_year: '2025-2026',
    current_year: 3,
    semester: 6,
    cgpa: '',
    internal_marks: '',
    backlog_count: 0,
    overall_attendance: '',
    assignment_completion_rate: '',
    coding_score: '',
    aptitude_score: '',
    mock_interview_score: '',
    hackathon_count: 0,
    certification_count: 0,
    initial_password: 'Student@2026',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search,
        department: department !== 'all' ? department : undefined,
        current_year: currentYear ? parseInt(currentYear) : undefined,
        risk_level: riskLevel !== 'all' ? riskLevel : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit,
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, department, currentYear, riskLevel, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        student_id: formData.student_id.trim().toUpperCase(),
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        internal_marks: formData.internal_marks ? parseFloat(formData.internal_marks) : undefined,
        backlog_count: parseInt(formData.backlog_count) || 0,
        overall_attendance: formData.overall_attendance ? parseFloat(formData.overall_attendance) : undefined,
        assignment_completion_rate: formData.assignment_completion_rate ? parseFloat(formData.assignment_completion_rate) : undefined,
        coding_score: formData.coding_score ? parseFloat(formData.coding_score) : undefined,
        aptitude_score: formData.aptitude_score ? parseFloat(formData.aptitude_score) : undefined,
        mock_interview_score: formData.mock_interview_score ? parseFloat(formData.mock_interview_score) : undefined,
        hackathon_count: parseInt(formData.hackathon_count) || 0,
        certification_count: parseInt(formData.certification_count) || 0,
        current_year: parseInt(formData.current_year) || 3,
        semester: parseInt(formData.semester) || 6,
      };

      await api.createStudent(payload);
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create student record');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedStudent) return;
    try {
      await api.deactivateStudent(selectedStudent.id);
      setIsDeactivateModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate student');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total active cohort: {total} registered students across all departments
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              student_id: '',
              full_name: '',
              email: '',
              phone_number: '',
              department: 'Computer Science & Engineering',
              degree: 'B.Tech',
              academic_year: '2025-2026',
              current_year: 3,
              semester: 6,
              cgpa: '',
              internal_marks: '',
              backlog_count: 0,
              overall_attendance: '',
              assignment_completion_rate: '',
              coding_score: '',
              aptitude_score: '',
              mock_interview_score: '',
              hackathon_count: 0,
              certification_count: 0,
              initial_password: 'Student@2026',
            });
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="uni-card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, or email..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-[#DCE5F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication Engineering">ECE</option>
              <option value="Data Science & Artificial Intelligence">DSAI</option>
              <option value="Mechanical Engineering">MECH</option>
            </select>

            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
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
              className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Insufficient data">Insufficient Data</option>
            </select>

            <button
              type="submit"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Students Data Table */}
      <div className="uni-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Department & Year</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  onClick={() => {
                    setSortBy('success_score');
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Success Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  onClick={() => {
                    setSortBy('overall_attendance');
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">CGPA / Backlogs</th>
                <th className="py-3 px-4">Placement Readiness</th>
                <th className="py-3 px-4">Risk Flag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading student cohort...
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
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#10213A]">{s.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{s.department}</div>
                      <div className="text-[10px] text-slate-400">
                        Year {s.current_year} • Sem {s.semester}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-sm text-[#10213A]">
                          {s.success_score !== null ? s.success_score : '—'}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      {s.is_provisional && (
                        <span className="text-[9px] text-slate-400 font-medium">Provisional</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          (s.overall_attendance || 0) < 65
                            ? 'text-red-600'
                            : (s.overall_attendance || 0) < 75
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {s.overall_attendance ? `${s.overall_attendance}%` : 'Unassessed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium">{s.cgpa ? `${s.cgpa} CGPA` : '—'}</div>
                      <div
                        className={`text-[10px] ${
                          s.backlog_count > 0 ? 'text-red-600 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {s.backlog_count > 0 ? `${s.backlog_count} Backlog(s)` : '0 Backlogs'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.placement_score !== null ? (
                        <div>
                          <span className="font-bold text-slate-800">{s.placement_score}/100</span>
                          <div className="text-[10px] text-slate-400">
                            Coding: {s.coding_score || '—'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassessed</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge label={s.combined_risk} variant="risk" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/students/${s.id}`)}
                          title="View Profile"
                          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsDeactivateModalOpen(true);
                          }}
                          title="Deactivate Student"
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} records
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student Record"
        subtitle="Registers student profile, computes initial success score, and provisions portal auth."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                placeholder="e.g. STU2050"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Full student name"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@unisphere.edu"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Communication Engineering">ECE</option>
                <option value="Data Science & Artificial Intelligence">DSAI</option>
                <option value="Mechanical Engineering">MECH</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Current Year
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={formData.current_year}
                onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Semester
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-blue-900 mb-2">Academic & Attendance Indicators</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  CGPA (0 - 10.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  placeholder="e.g. 8.4"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  Internal Marks (0-100)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.internal_marks}
                  onChange={(e) => setFormData({ ...formData, internal_marks: e.target.value })}
                  placeholder="e.g. 78"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  Backlog Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.backlog_count}
                  onChange={(e) => setFormData({ ...formData, backlog_count: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  Attendance % (0-100)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.overall_attendance}
                  onChange={(e) => setFormData({ ...formData, overall_attendance: e.target.value })}
                  placeholder="e.g. 88.5"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  LMS Completion %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.assignment_completion_rate}
                  onChange={(e) => setFormData({ ...formData, assignment_completion_rate: e.target.value })}
                  placeholder="e.g. 92.0"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-orange-900 mb-2">Placement Readiness Scores</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  Coding Score (0-100)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.coding_score}
                  onChange={(e) => setFormData({ ...formData, coding_score: e.target.value })}
                  placeholder="e.g. 85"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  Aptitude (0-100)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.aptitude_score}
                  onChange={(e) => setFormData({ ...formData, aptitude_score: e.target.value })}
                  placeholder="e.g. 80"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                  Mock Interview (0-100)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.mock_interview_score}
                  onChange={(e) => setFormData({ ...formData, mock_interview_score: e.target.value })}
                  placeholder="e.g. 75"
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {formSubmitting ? 'Creating...' : 'Register Student & Compute Score'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Student Confirmation Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Confirm Deactivation"
        subtitle="Mark student as inactive and suspend portal authentication."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to deactivate student{' '}
            <strong className="text-slate-900">{selectedStudent?.full_name}</strong> (
            {selectedStudent?.student_id})? This action disables their login and flags their
            enrollment as inactive.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeactivateModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
            >
              Confirm Deactivation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

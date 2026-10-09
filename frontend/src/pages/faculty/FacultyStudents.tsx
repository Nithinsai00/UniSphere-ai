import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckSquare,
  AlertTriangle,
  X,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const FacultyStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [departmentName, setDepartmentName] = useState('');
  const [search, setSearch] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [riskType, setRiskType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Message modal state
  const [messageModalStudent, setMessageModalStudent] = useState<any | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageCategory, setMessageCategory] = useState('Academic Support');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccessNotice, setMessageSuccessNotice] = useState<string | null>(null);

  // Task modal state
  const [taskModalStudent, setTaskModalStudent] = useState<any | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskSubject, setTaskSubject] = useState('Operating Systems');
  const [taskReason, setTaskReason] = useState('Low internal assessment score');
  const [taskDueDate, setTaskDueDate] = useState('Next Thursday, 5:00 PM');
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [taskSuccessNotice, setTaskSuccessNotice] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyStudents({
        search,
        current_year: currentYear ? parseInt(currentYear) : undefined,
        risk_type: riskType,
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
  }, [page, currentYear, riskType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  // Submit Send Message
  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageModalStudent || !messageSubject.trim() || !messageContent.trim()) return;

    setIsSendingMessage(true);
    try {
      await api.sendFacultyMessage({
        student_id: messageModalStudent.id,
        subject: messageSubject.trim(),
        content: messageContent.trim(),
        category: messageCategory,
      });
      setMessageSuccessNotice(`Message sent successfully to ${messageModalStudent.full_name}!`);
      setTimeout(() => {
        setMessageSuccessNotice(null);
        setMessageModalStudent(null);
        setMessageSubject('');
        setMessageContent('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Submit Assign Task
  const handleAssignTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskModalStudent || !taskTitle.trim() || !taskDescription.trim()) return;

    setIsAssigningTask(true);
    try {
      await api.assignImprovementTask({
        student_id: taskModalStudent.id,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        subject: taskSubject.trim(),
        reason: taskReason.trim(),
        due_date: taskDueDate.trim(),
      });
      setTaskSuccessNotice(`Improvement task assigned to ${taskModalStudent.full_name}!`);
      setTimeout(() => {
        setTaskSuccessNotice(null);
        setTaskModalStudent(null);
        setTaskTitle('');
        setTaskDescription('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to assign task.');
    } finally {
      setIsAssigningTask(false);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Department Students: {departmentName || 'Computer Science & Engineering'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total cohort: {total} student records in your departmental jurisdiction
          </p>
        </div>
      </div>

      {/* Filter Bar with Requirement 7 Risk Filters */}
      <div className="uni-card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or name..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-[#DCE5F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
            <option value="">All Academic Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Requirement 7: Exactly the 4 configured risk types */}
          <select
            value={riskType}
            onChange={(e) => {
              setRiskType(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-semibold"
          >
            <option value="all">1. All Risk Types</option>
            <option value="placement">2. Placement Risk</option>
            <option value="attendance">3. Attendance Risk (&lt; 75%)</option>
            <option value="cgpa">4. Low CGPA Risk (&lt; 6.0)</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Apply Filter
          </button>
        </form>
      </div>

      {/* Students Table with Risk Indicators & Actions */}
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
                <th className="py-3 px-4">Risk Indicators & Evidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                    Loading department student roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No students matching active filter criteria.
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
                      <span className="font-extrabold text-slate-900">{roundVal(s.success_score)}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          (s.overall_attendance || 0) < 75 ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {s.overall_attendance ? `${roundVal(s.overall_attendance)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span>{s.cgpa ?? 'N/A'}</span>
                      {s.backlog_count > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold text-red-600">
                          ({s.backlog_count} backlogs)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {s.risk_indicators && s.risk_indicators.length > 0 ? (
                        <div className="space-y-1">
                          {s.risk_indicators.map((ind: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.badgeColor}`}
                              >
                                {ind.type}
                              </span>
                              <span className="text-[11px] text-slate-500">{ind.evidence}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Low Risk (Optimal Standing)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setMessageModalStudent(s)}
                          title="Send Direct Message"
                          className="p-1.5 text-slate-500 hover:text-[#0B4A2B] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskModalStudent(s)}
                          title="Assign Improvement Task"
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/faculty/students/${s.id}`)}
                          title="View Full Profile"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({total} students)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Message Modal (Requirement 9) */}
      {messageModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="uni-card w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#082F1B]">
                  Send Message to Student
                </h3>
                <p className="text-xs text-slate-500">
                  Recipient: <span className="font-semibold text-slate-800">{messageModalStudent.full_name}</span> ({messageModalStudent.student_id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMessageModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {messageSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{messageSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleSendMessageSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Category
                </label>
                <select
                  value={messageCategory}
                  onChange={(e) => setMessageCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Academic Support">Academic Support</option>
                  <option value="Attendance Warning">Attendance Warning</option>
                  <option value="Placement Preparation">Placement Preparation</option>
                  <option value="General Notice">General Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="e.g. Scheduled Mentoring Session & Coursework Review"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Write clear instructions, dates, or feedback for the student..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMessageModalStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMessage || !messageSubject.trim() || !messageContent.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Improvement Task Modal (Requirement 8) */}
      {taskModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="uni-card w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#082F1B]">
                  Assign Improvement Task
                </h3>
                <p className="text-xs text-slate-500">
                  Target Student: <span className="font-semibold text-slate-800">{taskModalStudent.full_name}</span> ({taskModalStudent.student_id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTaskModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {taskSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{taskSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleAssignTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Operating Systems: Paging & Memory Problem Set 3"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    required
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="text"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Support
                </label>
                <input
                  type="text"
                  value={taskReason}
                  onChange={(e) => setTaskReason(e.target.value)}
                  placeholder="e.g. Scored below 60% in mid-term evaluation 1"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Explain the required problems to solve or exercises to submit..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaskModalStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningTask || !taskTitle.trim() || !taskDescription.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isAssigningTask ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Assign Improvement Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function roundVal(val: any): string {
  if (val === undefined || val === null) return '0';
  return Math.round(Number(val)).toString();
}

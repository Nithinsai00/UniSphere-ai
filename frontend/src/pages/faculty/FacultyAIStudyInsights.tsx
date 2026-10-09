import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  AlertTriangle,
  Send,
  FilePlus,
  BookOpen,
  Search,
  CheckCircle2,
  X,
  Info,
  Sparkles,
} from 'lucide-react';

interface AttentionStudent {
  id: number;
  student_id: string;
  name: string;
  risk_level: string;
  attendance: string;
  internal_marks: string;
  cgpa: string;
  risk_factors: string[];
  recommended_action: string;
}

export const FacultyAIStudyInsights: React.FC = () => {
  const [data, setData] = useState<{
    department: string;
    criteria_explanation: string;
    students_needing_immediate_attention: AttentionStudent[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<AttentionStudent | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskSubject, setTaskSubject] = useState('Operating Systems');
  const [taskDueDate, setTaskDueDate] = useState('This Thursday, 5:00 PM');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFacultyStudyInsights();
      setData(res);
    } catch (err) {
      console.error('Failed to load study insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMessageModal = (student: AttentionStudent) => {
    setSelectedStudent(student);
    setMessageSubject(`Academic Follow-up & Mentoring — ${student.name}`);
    setMessageContent(
      `Dear ${student.name},\n\nI reviewed your recent performance indicators (${student.risk_factors.join(', ')}). I would like to schedule a mentoring check-in to assist you with your coursework.\n\nPlease confirm your availability this week.\n\nBest regards,\nCourse Faculty`
    );
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !messageSubject.trim() || !messageContent.trim()) return;

    try {
      setIsSubmittingMessage(true);
      await api.sendFacultyMessage({
        student_id: selectedStudent.id,
        subject: messageSubject.trim(),
        content: messageContent.trim(),
        category: 'Mentoring',
      });
      setIsMessageModalOpen(false);
      setNotification({
        type: 'success',
        text: `Message successfully sent to ${selectedStudent.name}.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'Failed to send message.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleOpenTaskModal = (student: AttentionStudent) => {
    setSelectedStudent(student);
    setTaskTitle(`Targeted Revision: ${student.recommended_action}`);
    setTaskDescription(
      `Complete practice problem set addressing specific weak areas identified in Continuous Evaluation. Review class lecture notes and submit work by the designated deadline.`
    );
    setIsTaskModalOpen(true);
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !taskTitle.trim() || !taskDescription.trim()) return;

    try {
      setIsSubmittingTask(true);
      await api.assignImprovementTask({
        student_id: selectedStudent.id,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        subject: taskSubject.trim(),
        due_date: taskDueDate.trim(),
        reason: selectedStudent.risk_factors.join('; '),
      });
      setIsTaskModalOpen(false);
      setNotification({
        type: 'success',
        text: `Improvement task successfully assigned to ${selectedStudent.name}.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'Failed to assign task.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const filteredStudents = (data?.students_needing_immediate_attention || []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#1E3E2D]">AI Study Insights</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#0B4A2B] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence-Based
            </span>
          </div>
          <p className="text-xs text-[#52796F] mt-1">
            Predictive academic diagnostic flagging students requiring targeted pedagogical intervention
          </p>
        </div>
      </div>

      {/* Criteria Explanation Banner */}
      <div className="bg-[#EDF5EE] border border-[#CFE1D4] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-[#0B4A2B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs text-[#2D5A3E] space-y-1">
          <p className="font-bold text-[#1E3E2D]">Diagnostic Evaluation Criteria & Rules</p>
          <p className="leading-relaxed">
            {data?.criteria_explanation ||
              'Identified using verified university thresholds: Attendance < 75%, Internal Marks < 60%, CGPA < 6.0, and Placement Readiness Score < 60%. Insights are evidence-grounded and require faculty review before action.'}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-[#DDE7DF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flagged student by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-[#1E3E2D]">{filteredStudents.length}</span> students requiring priority action
        </div>
      </div>

      {/* Flagged Students Table */}
      <div className="bg-white rounded-2xl border border-[#DDE7DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E3E2D] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Students Needing Immediate Attention
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-4 border-[#0B4A2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Evaluating student diagnostic records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No flagged students match your criteria. All monitored students meet expected thresholds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF5EE]/60 text-[#1E3E2D] font-bold border-b border-[#DDE7DF]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Internal</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-4">Identified Risk Factors</th>
                  <th className="py-3 px-4">Recommended Action</th>
                  <th className="py-3 px-4 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1E3E2D]">
                      <div>{s.name}</div>
                      <div className="text-[11px] font-normal text-slate-400 font-mono">{s.student_id}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          s.risk_level === 'High'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-semibold ${
                          parseFloat(s.attendance) < 75 ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        {s.attendance}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-semibold ${
                          parseFloat(s.internal_marks) < 60 ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {s.internal_marks}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{s.cgpa}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.risk_factors.map((factor, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#0B4A2B]">{s.recommended_action}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenMessageModal(s)}
                          title="Send Message"
                          className="p-1.5 rounded-lg bg-emerald-50 text-[#0B4A2B] hover:bg-[#0B4A2B] hover:text-white transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenTaskModal(s)}
                          title="Assign Improvement Task"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <FilePlus className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href="/faculty/study-materials"
                          title="Share Study Material"
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {isMessageModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#EDF5EE] border-b border-[#DDE7DF] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1E3E2D]">
                  Send Academic Notice & Mentoring Message
                </h3>
                <p className="text-[11px] text-[#52796F]">
                  Recipient: {selectedStudent.name} ({selectedStudent.student_id})
                </p>
              </div>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B] resize-none leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMessage}
                  className="px-4 py-2 rounded-xl bg-[#0B4A2B] text-white font-semibold hover:bg-[#07361F] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {isTaskModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#EDF5EE] border-b border-[#DDE7DF] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1E3E2D]">
                  Assign Targeted Improvement Task
                </h3>
                <p className="text-[11px] text-[#52796F]">
                  Student: {selectedStudent.name} ({selectedStudent.student_id})
                </p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B] resize-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Submission Deadline</label>
                <input
                  type="text"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-4 py-2 rounded-xl bg-[#0B4A2B] text-white font-semibold hover:bg-[#07361F] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  {isSubmittingTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

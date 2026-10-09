import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';

export const FacultyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'tasks'>('assignments');
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Operating Systems');
  const [newTargetClass, setNewTargetClass] = useState('CSE - 3rd Year');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assRes, tasksRes] = await Promise.all([
        api.getFacultyAssignments(),
        api.getFacultyTasks(),
      ]);
      setAssignments(assRes || []);
      setTasks(tasksRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createFacultyAssignment({
        title: newTitle.trim(),
        subject: newSubject.trim(),
        target_class: newTargetClass,
        due_date: newDueDate.trim(),
        description: newDescription.trim(),
        attachment_name: newAttachmentName.trim() || undefined,
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewAttachmentName('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.deleteFacultyAssignment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete assignment.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
            Assignments & Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[#446552] font-semibold mt-0.5">
            Manage course assignments, lab evaluation specs, and student improvement tasks
          </p>
        </div>

        {activeTab === 'assignments' && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE5F3] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
            activeTab === 'assignments'
              ? 'border-[#0B4A2B] text-[#0B4A2B] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Class Assignments ({assignments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
            activeTab === 'tasks'
              ? 'border-[#0B4A2B] text-[#0B4A2B] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Improvement Tasks ({tasks.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Loading assignments data...</span>
        </div>
      ) : activeTab === 'assignments' ? (
        /* Class Assignments List */
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="uni-card p-10 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No assignments created yet</p>
              <p className="text-xs">Click 'Create Assignment' above to publish your first coursework task.</p>
            </div>
          ) : (
            assignments.map((item) => (
              <div
                key={item.id}
                className="uni-card p-5 hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#05603A]">
                        {item.subject}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">• {item.target_class}</span>
                      <span className="text-[11px] text-slate-400">• Due: {item.due_date}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0A2818] mt-1.5">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      {item.submissions_count || 0} Submissions
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(item.id)}
                      title="Delete assignment"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#446552] leading-relaxed whitespace-pre-line font-normal">
                  {item.description}
                </p>

                {item.attachment_name && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#0B4A2B]">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Attachment: {item.attachment_name}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Improvement Tasks List */
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="uni-card p-10 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No improvement tasks assigned</p>
              <p className="text-xs">
                Assign targeted tasks from Student Management to support students needing academic reinforcement.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="uni-card p-5 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0A2818]">{task.student_name}</span>
                    <span className="text-[11px] font-mono text-slate-400">({task.student_code})</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      {task.subject}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#082F1B]">{task.title}</h4>
                  <p className="text-xs text-slate-500">{task.description}</p>
                  <p className="text-[11px] text-amber-700 font-medium">Reason: {task.reason}</p>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due: {task.due_date}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 text-[#05603A]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status === 'completed' ? 'Completed' : 'Pending Review'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="uni-card w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#082F1B]">Publish Class Assignment</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Lab 4: Synchronization"
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
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Class
                  </label>
                  <input
                    type="text"
                    required
                    value={newTargetClass}
                    onChange={(e) => setNewTargetClass(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date & Time
                </label>
                <input
                  type="text"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="e.g. Next Monday, 11:59 PM"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Specifications
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain instructions, submission deliverables, and grading rubric..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attachment Name (Optional)
                </label>
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="e.g. OS_Lab_Specs_v2.pdf"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newDueDate.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Assignment</span>
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

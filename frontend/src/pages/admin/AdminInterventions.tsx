import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

export const AdminInterventions: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [impactRating, setImpactRating] = useState('improved');
  const [timelineNote, setTimelineNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadInterventions = async () => {
    setLoading(true);
    try {
      const [list, intStats] = await Promise.all([
        api.getInterventions({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        }),
        api.getInterventionStats(),
      ]);
      setInterventions(list || []);
      setStats(intStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterventions();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const openUpdateModal = (c: any) => {
    setSelectedCase(c);
    setNewStatus(c.status);
    setOutcomeNotes(c.outcome_notes || '');
    setImpactRating(c.impact_rating || 'improved');
    setTimelineNote('');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      await api.updateInterventionStatus(selectedCase.id, {
        status: newStatus,
        outcome_notes: outcomeNotes || undefined,
        impact_rating: newStatus === 'completed' ? impactRating : undefined,
        note: timelineNote || `Status updated to ${newStatus}`,
      });
      setIsUpdateModalOpen(false);
      loadInterventions();
    } catch (err: any) {
      alert(err.message || 'Failed to update intervention');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Intervention & Mentoring Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student support workflows from risk identification through verified outcome
            resolution
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="uni-card p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Cases Logged
          </span>
          <div className="text-2xl font-bold text-[#10213A] mt-1">{stats?.total_cases || 0}</div>
        </div>
        <div className="uni-card p-4 border-amber-200 bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Active / In Progress
          </span>
          <div className="text-2xl font-bold text-amber-900 mt-1">{stats?.open_cases || 0}</div>
        </div>
        <div className="uni-card p-4 border-red-200 bg-red-50/20">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
            Overdue Follow-ups
          </span>
          <div className="text-2xl font-bold text-red-900 mt-1">{stats?.overdue_cases || 0}</div>
        </div>
        <div className="uni-card p-4 border-emerald-200 bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Resolved / Completed
          </span>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{stats?.completed_cases || 0}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="uni-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter by:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium"
        >
          <option value="all">All Categories</option>
          <option value="attendance_support">Attendance Support</option>
          <option value="academic_mentoring">Academic Mentoring</option>
          <option value="remedial_teaching">Remedial Teaching</option>
          <option value="assignment_followup">Assignment Follow-up</option>
          <option value="coding_practice">Coding Practice</option>
          <option value="aptitude_preparation">Aptitude Preparation</option>
          <option value="mock_interview">Mock Interview</option>
          <option value="general_support">General Support</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Interventions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading cases...</div>
        ) : interventions.length === 0 ? (
          <div className="uni-card p-12 text-center text-xs text-slate-400">
            No interventions matching filters.
          </div>
        ) : (
          interventions.map((it) => (
            <div
              key={it.id}
              className="uni-card p-5 space-y-3 hover:border-blue-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#10213A]">{it.title}</span>
                  <Badge label={it.status} variant="status" size="sm" />
                  <Badge label={it.priority} variant="priority" size="sm" />
                </div>
                <button
                  onClick={() => openUpdateModal(it)}
                  className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold self-start sm:self-auto cursor-pointer"
                >
                  Update Status / Add Note
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{it.description}</p>

              {it.outcome_notes && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Outcome Verified:</span>
                  </div>
                  <span>{it.outcome_notes}</span>
                </div>
              )}

              {/* Timeline Updates */}
              {it.updates && it.updates.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Timeline Notes ({it.updates.length}):
                  </span>
                  {it.updates.slice(0, 3).map((up: any) => (
                    <div
                      key={up.id}
                      className="text-xs text-slate-600 bg-slate-50 p-2 rounded flex items-start justify-between"
                    >
                      <div>
                        <strong className="text-slate-800">{up.author_name}:</strong> {up.notes}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(up.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span>Student: <strong className="text-slate-700">{it.student_name}</strong> ({it.student_roll})</span>
                  <span>Dept: <strong className="text-slate-700">{it.department}</strong></span>
                  <span>Mentor: <strong className="text-slate-700">{it.faculty_name}</strong></span>
                </div>
                <div>
                  Due: {it.due_date ? new Date(it.due_date).toLocaleDateString() : 'Flexible'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Intervention Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Intervention Progress"
        subtitle={selectedCase ? `${selectedCase.title} • Student: ${selectedCase.student_name}` : ''}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Case Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed / Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Add Timeline Observation Note
            </label>
            <textarea
              rows={2}
              value={timelineNote}
              onChange={(e) => setTimelineNote(e.target.value)}
              placeholder="e.g. Conducted 2nd remedial session; student submitted pending lab assignments..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          {newStatus === 'completed' && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                  Recorded Outcome Notes *
                </label>
                <textarea
                  rows={2}
                  required
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Record measurable changes: e.g. Attendance increased to 78%, cleared 1 backlog..."
                  className="w-full text-xs px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                  Impact Rating
                </label>
                <select
                  value={impactRating}
                  onChange={(e) => setImpactRating(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-emerald-200 rounded-lg"
                >
                  <option value="improved">Measurable Improvement</option>
                  <option value="unchanged">Stabilized / Unchanged</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {submitting ? 'Updating...' : 'Save Progress Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

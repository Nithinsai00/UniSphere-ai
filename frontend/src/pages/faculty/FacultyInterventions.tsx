import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LifeBuoy, Clock, CheckCircle2, TrendingUp, Filter } from 'lucide-react';

export const FacultyInterventions: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [impactRating, setImpactRating] = useState('improved');
  const [timelineNote, setTimelineNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getInterventions();
      setInterventions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openUpdateModal = (c: any) => {
    setSelectedCase(c);
    setNewStatus(c.status);
    setOutcomeNotes(c.outcome_notes || '');
    setImpactRating(c.impact_rating || 'improved');
    setTimelineNote('');
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
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
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update intervention');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
          Faculty Mentoring Cases & Interventions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Active student academic guidance, remedial tutoring progress, and outcome verification
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading cases...</div>
        ) : interventions.length === 0 ? (
          <div className="uni-card p-12 text-center text-xs text-slate-400">
            No mentoring interventions currently assigned to your queue.
          </div>
        ) : (
          interventions.map((it) => (
            <div key={it.id} className="uni-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#10213A]">{it.title}</span>
                  <Badge label={it.status} variant="status" size="sm" />
                  <Badge label={it.priority} variant="priority" size="sm" />
                </div>
                <button
                  onClick={() => openUpdateModal(it)}
                  className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold cursor-pointer"
                >
                  Update Mentoring Progress
                </button>
              </div>

              <p className="text-xs text-slate-600">{it.description}</p>

              {it.outcome_notes && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <strong>Outcome Logged:</strong> {it.outcome_notes}
                </div>
              )}

              {/* Updates timeline */}
              {it.updates && it.updates.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Updates:</span>
                  {it.updates.slice(0, 2).map((up: any) => (
                    <div key={up.id} className="text-xs text-slate-600 bg-slate-50 p-1.5 rounded">
                      <strong>{up.author_name}:</strong> {up.notes}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Student: <strong className="text-slate-700">{it.student_name}</strong> ({it.student_roll})</span>
                <span>Due: {it.due_date ? new Date(it.due_date).toLocaleDateString() : 'Flexible'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Record Mentoring Update"
        subtitle={selectedCase ? `Student: ${selectedCase.student_name}` : ''}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed / Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Add Observation / Progress Note
            </label>
            <textarea
              rows={2}
              value={timelineNote}
              onChange={(e) => setTimelineNote(e.target.value)}
              placeholder="e.g. Completed weekly DSA tutorial; student cleared all test cases..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          {newStatus === 'completed' && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
              <label className="block text-[11px] font-bold text-emerald-900 uppercase">
                Final Outcome Notes *
              </label>
              <textarea
                rows={2}
                required
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Measurable improvement achieved..."
                className="w-full text-xs px-3 py-2 bg-white border border-emerald-200 rounded-lg"
              />
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
              className="px-4 py-1.5 bg-[#245BB5] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

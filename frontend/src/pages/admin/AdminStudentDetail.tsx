import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  Award,
  Briefcase,
  AlertTriangle,
  Compass,
  LifeBuoy,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const AdminStudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Intervention modal
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [intCategory, setIntCategory] = useState('attendance_support');
  const [intPriority, setIntPriority] = useState('high');
  const [intTitle, setIntTitle] = useState('');
  const [intDesc, setIntDesc] = useState('');
  const [submittingInt, setSubmittingInt] = useState(false);

  const loadStudentData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const studentIdNum = parseInt(id);
      const [sData, sRecs, sInts] = await Promise.all([
        api.getStudentDetail(studentIdNum),
        api.getStudentRecommendations(studentIdNum),
        api.getInterventions({ student_id: studentIdNum }),
      ]);
      setStudent(sData);
      setRecommendations(sRecs.recommendations || []);
      setInterventions(sInts || []);
      setIntTitle(`Support Mentoring Plan for ${sData.full_name}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSubmittingInt(true);
    try {
      await api.createIntervention({
        student_id: student.id,
        category: intCategory,
        priority: intPriority,
        title: intTitle,
        description: intDesc,
      });
      setIsInterventionModalOpen(false);
      setIntDesc('');
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Failed to create intervention');
    } finally {
      setSubmittingInt(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">
          Retrieving unified student profile...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>

        <button
          onClick={() => setIsInterventionModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#F58B35] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Initiate Mentoring Intervention</span>
        </button>
      </div>

      {/* Header Profile Banner */}
      <div className="uni-card p-6 bg-gradient-to-r from-white via-blue-50/20 to-orange-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#102B57] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {student.full_name ? student.full_name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#10213A]">{student.full_name}</h1>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  {student.student_id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {student.enrollment_status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {student.department} • {student.degree} (Year {student.current_year}, Semester{' '}
                {student.semester}) • {student.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-600 font-medium">Segment:</span>
                <span className="text-xs font-bold text-blue-800 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                  {student.segment}
                </span>
              </div>
            </div>
          </div>

          {/* Big Success Score Display */}
          <div className="flex flex-col items-end bg-white p-4 rounded-xl border border-[#DCE5F3] shadow-xs shrink-0 min-w-[160px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Student Success Score
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-[#10213A]">
                {student.success_score !== null ? student.success_score : '—'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
            {student.is_provisional && (
              <span className="text-[10px] text-amber-600 font-semibold mt-1">
                Provisional (Missing placement test)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5 Core Normalized Components Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Academics (30%)</span>
          <div className="text-lg font-bold text-blue-900 mt-1">
            {student.academic_score !== null ? `${student.academic_score}` : 'Unassessed'}
          </div>
          <span className="text-[11px] text-slate-500">CGPA: {student.cgpa || '—'}</span>
        </div>
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance (20%)</span>
          <div className="text-lg font-bold text-blue-900 mt-1">
            {student.attendance_score !== null ? `${student.attendance_score}%` : 'Unassessed'}
          </div>
          <span className="text-[11px] text-slate-500">Benchmark: 75%</span>
        </div>
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">LMS Activity (15%)</span>
          <div className="text-lg font-bold text-blue-900 mt-1">
            {student.lms_score !== null ? `${student.lms_score}` : 'Unassessed'}
          </div>
          <span className="text-[11px] text-slate-500">
            {student.assignment_completion_rate ? `${student.assignment_completion_rate}% done` : '—'}
          </span>
        </div>
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Placement (20%)</span>
          <div className="text-lg font-bold text-orange-600 mt-1">
            {student.placement_score !== null ? `${student.placement_score}` : 'Unassessed'}
          </div>
          <span className="text-[11px] text-slate-500">Coding: {student.coding_score || '—'}</span>
        </div>
        <div className="uni-card p-3.5 text-center col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Skills & Co-Curricular (15%)</span>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            {student.skills_score !== null ? `${student.skills_score}` : '0'}
          </div>
          <span className="text-[11px] text-slate-500">
            {student.hackathon_count} Hackathons • {student.certification_count} Certs
          </span>
        </div>
      </div>

      {/* Explainable Risk Assessment Triggers */}
      <div className="uni-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-[#10213A]">
              Explainable Risk Indicators & Triggers
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={`Academic: ${student.academic_risk}`} variant="risk" size="sm" />
            <Badge label={`Placement: ${student.placement_risk}`} variant="risk" size="sm" />
            <Badge label={`Combined: ${student.combined_risk}`} variant="risk" size="sm" />
          </div>
        </div>

        {student.risk_reasons && student.risk_reasons.length > 0 ? (
          <div className="space-y-2">
            {student.risk_reasons.map((r: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{r.indicator}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-red-600 font-semibold">Value: {r.value}</span>
                    <span className="text-slate-400">(Threshold: {r.threshold})</span>
                  </div>
                  <p className="text-slate-600 mt-1">{r.message}</p>
                </div>
                <Badge label={r.severity || 'warning'} variant="risk" size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All monitored metrics satisfy institutional thresholds. No active risk flags.
            </span>
          </div>
        )}
      </div>

      {/* Grounded Recommendations */}
      <div className="uni-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-[#10213A]">Recommended Interventions</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Grounded in verified records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-200 transition-colors text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10213A]">{rec.title}</span>
                <Badge label={rec.priority} variant="priority" size="sm" />
              </div>
              <p className="text-slate-500 text-[11px]">{rec.reason}</p>
              <div className="bg-blue-50/70 p-2 rounded text-blue-900 font-medium text-[11px]">
                👉 {rec.action}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Category: {rec.category.replace('_', ' ')}</span>
                <span>Follow-up target: within {rec.target_days} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention History */}
      <div className="uni-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#10213A]">Faculty Interventions & Mentoring History</h3>
          </div>
          <span className="text-xs text-slate-500">{interventions.length} Case(s) Recorded</span>
        </div>

        {interventions.length > 0 ? (
          <div className="space-y-3">
            {interventions.map((it: any) => (
              <div
                key={it.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800">{it.title}</div>
                  <Badge label={it.status} variant="status" size="sm" />
                </div>
                <p className="text-slate-600">{it.description}</p>
                {it.outcome_notes && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px]">
                    <strong>Outcome Notes:</strong> {it.outcome_notes}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Mentor: {it.faculty_name}</span>
                  <span>
                    Created: {new Date(it.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No active or historical interventions logged for this student.
          </div>
        )}
      </div>

      {/* Create Intervention Modal */}
      <Modal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        title="Schedule New Mentoring Intervention"
        subtitle={`Student: ${student.full_name} (${student.student_id})`}
      >
        <form onSubmit={handleCreateIntervention} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Intervention Category
            </label>
            <select
              value={intCategory}
              onChange={(e) => setIntCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="attendance_support">Attendance Support</option>
              <option value="academic_mentoring">Academic Mentoring</option>
              <option value="remedial_teaching">Remedial Teaching</option>
              <option value="assignment_followup">Assignment Follow-up</option>
              <option value="coding_practice">Coding Practice / DSA</option>
              <option value="aptitude_preparation">Aptitude Preparation</option>
              <option value="mock_interview">Mock Interview Drill</option>
              <option value="general_support">General Student Support</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Priority
            </label>
            <select
              value={intPriority}
              onChange={(e) => setIntPriority(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Plan Title
            </label>
            <input
              type="text"
              required
              value={intTitle}
              onChange={(e) => setIntTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Mentoring Action Notes & Strategy
            </label>
            <textarea
              rows={3}
              required
              value={intDesc}
              onChange={(e) => setIntDesc(e.target.value)}
              placeholder="Outline specific objectives, review schedule, and milestone expectations..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsInterventionModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingInt}
              className="px-4 py-1.5 bg-[#F58B35] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {submittingInt ? 'Saving...' : 'Deploy Intervention'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

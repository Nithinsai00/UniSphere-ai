import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  LifeBuoy,
  AlertTriangle,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const FacultyStudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Intervention modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intCategory, setIntCategory] = useState('academic_mentoring');
  const [intPriority, setIntPriority] = useState('high');
  const [intTitle, setIntTitle] = useState('');
  const [intDesc, setIntDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const sId = parseInt(id);
      const [sData, sRecs, sInts] = await Promise.all([
        api.getFacultyStudentDetail(sId),
        api.getStudentRecommendations(sId),
        api.getInterventions({ student_id: sId }),
      ]);
      setStudent(sData);
      setRecommendations(sRecs.recommendations || []);
      setInterventions(sInts || []);
      setIntTitle(`Faculty Mentoring Plan for ${sData.full_name}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Access denied: Student is outside your department jurisdiction.');
      navigate('/faculty/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSubmitting(true);
    try {
      await api.createIntervention({
        student_id: student.id,
        category: intCategory,
        priority: intPriority,
        title: intTitle,
        description: intDesc,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create intervention');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">Loading permitted student profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/faculty/students')}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Students</span>
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#F58B35] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Assign Faculty Intervention</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="uni-card p-6 bg-gradient-to-r from-white to-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#245BB5] text-white flex items-center justify-center font-bold text-2xl">
              {student.full_name ? student.full_name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#10213A]">{student.full_name}</h1>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  {student.student_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {student.department} • Year {student.current_year} (Semester {student.semester}) • {student.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-600 font-medium">Segment:</span>
                <span className="text-xs font-bold text-blue-800 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                  {student.segment}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCE5F3] shadow-xs text-right min-w-[150px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Success Score</span>
            <div className="text-3xl font-black text-[#10213A] mt-1">
              {student.success_score !== null ? student.success_score : '—'}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Components */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Academics</span>
          <div className="text-lg font-bold text-blue-900 mt-1">{student.academic_score || '—'}</div>
          <span className="text-[11px] text-slate-500">CGPA: {student.cgpa || '—'}</span>
        </div>
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance</span>
          <div className="text-lg font-bold text-blue-900 mt-1">{student.attendance_score ? `${student.attendance_score}%` : '—'}</div>
          <span className="text-[11px] text-slate-500">Benchmark: 75%</span>
        </div>
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">LMS Completion</span>
          <div className="text-lg font-bold text-blue-900 mt-1">{student.lms_score || '—'}</div>
          <span className="text-[11px] text-slate-500">{student.assignment_completion_rate ? `${student.assignment_completion_rate}% done` : '—'}</span>
        </div>
        <div className="uni-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Placement</span>
          <div className="text-lg font-bold text-orange-600 mt-1">{student.placement_score !== null ? student.placement_score : 'Unassessed'}</div>
          <span className="text-[11px] text-slate-500">Coding: {student.coding_score || '—'}</span>
        </div>
        <div className="uni-card p-3.5 text-center col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Skills</span>
          <div className="text-lg font-bold text-emerald-700 mt-1">{student.skills_score || '0'}</div>
          <span className="text-[11px] text-slate-500">{student.hackathon_count} Hackathons</span>
        </div>
      </div>

      {/* Explainable Triggers */}
      <div className="uni-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-[#10213A]">Explainable Risk Triggers</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={`Academic: ${student.academic_risk}`} variant="risk" size="sm" />
            <Badge label={`Placement: ${student.placement_risk}`} variant="risk" size="sm" />
          </div>
        </div>

        {student.risk_reasons && student.risk_reasons.length > 0 ? (
          <div className="space-y-2">
            {student.risk_reasons.map((r: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800">{r.indicator}: </span>
                <span className="text-red-600 font-semibold">{r.value} </span>
                <span className="text-slate-500">(Threshold: {r.threshold}) — {r.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Student satisfies all departmental performance benchmarks.</span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="uni-card p-5">
        <h3 className="text-sm font-bold text-[#10213A] mb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Recommended Faculty Interventions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10213A]">{rec.title}</span>
                <Badge label={rec.priority} variant="priority" size="sm" />
              </div>
              <p className="text-slate-500 text-[11px]">{rec.reason}</p>
              <div className="bg-blue-50 p-2 rounded text-blue-900 font-medium text-[11px]">
                👉 {rec.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Intervention Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Mentoring Intervention"
        subtitle={`Student: ${student.full_name} (${student.student_id})`}
      >
        <form onSubmit={handleCreateIntervention} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
            <select
              value={intCategory}
              onChange={(e) => setIntCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="attendance_support">Attendance Support</option>
              <option value="academic_mentoring">Academic Mentoring</option>
              <option value="remedial_teaching">Remedial Teaching</option>
              <option value="assignment_followup">Assignment Follow-up</option>
              <option value="coding_practice">Coding Practice</option>
              <option value="aptitude_preparation">Aptitude Preparation</option>
              <option value="mock_interview">Mock Interview</option>
              <option value="general_support">General Support</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Priority</label>
            <select
              value={intPriority}
              onChange={(e) => setIntPriority(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Plan Title</label>
            <input
              type="text"
              required
              value={intTitle}
              onChange={(e) => setIntTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notes</label>
            <textarea
              rows={3}
              required
              value={intDesc}
              onChange={(e) => setIntDesc(e.target.value)}
              placeholder="Outline specific guidance and milestone dates..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-[#F58B35] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {submitting ? 'Scheduling...' : 'Confirm Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

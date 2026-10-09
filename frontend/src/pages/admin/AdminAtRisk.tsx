import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  AlertTriangle,
  LifeBuoy,
  Eye,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AdminAtRisk: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('type') || 'combined';
  const [activeTab, setActiveTab] = useState<'all' | 'combined' | 'academic' | 'placement'>(
    initialTab as any
  );
  const [department, setDepartment] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Intervention modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isIntModalOpen, setIsIntModalOpen] = useState(false);
  const [intCategory, setIntCategory] = useState('attendance_support');
  const [intPriority, setIntPriority] = useState('high');
  const [intTitle, setIntTitle] = useState('');
  const [intDesc, setIntDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAtRiskStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        department: department !== 'all' ? department : undefined,
        limit: 100,
      });

      let allS = res.students || [];

      // Filter by activeTab
      if (activeTab === 'combined') {
        allS = allS.filter((s: any) => s.combined_risk === 'High');
      } else if (activeTab === 'academic') {
        allS = allS.filter((s: any) => s.academic_risk === 'High');
      } else if (activeTab === 'placement') {
        allS = allS.filter((s: any) => s.placement_risk === 'High');
      } else {
        allS = allS.filter(
          (s: any) =>
            s.combined_risk === 'High' ||
            s.academic_risk === 'High' ||
            s.placement_risk === 'High'
        );
      }

      setStudents(allS);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAtRiskStudents();
  }, [activeTab, department]);

  const openInterventionFor = (s: any) => {
    setSelectedStudent(s);
    setIntTitle(`Mentoring Recovery Plan for ${s.full_name}`);
    setIntCategory(
      (s.overall_attendance || 100) < 65
        ? 'attendance_support'
        : s.backlog_count > 0
        ? 'remedial_teaching'
        : (s.coding_score || 100) < 50
        ? 'coding_practice'
        : 'academic_mentoring'
    );
    setIntDesc(
      `Triggered by: ${
        s.risk_reasons
          ? s.risk_reasons.map((r: any) => `${r.indicator} (${r.value})`).join(', ')
          : 'High risk status'
      }`
    );
    setIsIntModalOpen(true);
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await api.createIntervention({
        student_id: selectedStudent.id,
        category: intCategory,
        priority: intPriority,
        title: intTitle,
        description: intDesc,
      });
      setIsIntModalOpen(false);
      setSelectedStudent(null);
      alert('Mentoring intervention successfully assigned!');
    } catch (err: any) {
      alert(err.message || 'Failed to create intervention');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
              At-Risk Student Triage Queue
            </h1>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
              {students.length} Flagged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, explainable risk flags based on attendance, assessment trajectory, and coding readiness
          </p>
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#DCE5F3] shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Communication Engineering">ECE</option>
            <option value="Data Science & Artificial Intelligence">DSAI</option>
            <option value="Mechanical Engineering">MECH</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('combined')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'combined'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Combined High Risk
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'academic'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Academic Risk Only
        </button>
        <button
          onClick={() => setActiveTab('placement')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'placement'
              ? 'bg-[#245BB5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Placement Risk Only
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Flagged Cohorts
        </button>
      </div>

      {/* Triage Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Scanning institutional flags...
          </div>
        ) : students.length === 0 ? (
          <div className="uni-card p-12 text-center text-slate-400 text-xs">
            No students currently flagged in this risk category.
          </div>
        ) : (
          students.map((s) => (
            <div
              key={s.id}
              className="uni-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-red-500 hover:shadow-md transition-all"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm text-[#10213A]">{s.full_name}</span>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {s.student_id}
                  </span>
                  <span className="text-xs text-slate-500">
                    {s.department} (Year {s.current_year})
                  </span>
                  <Badge label={s.combined_risk + ' Risk'} variant="risk" size="sm" />
                </div>

                {/* Specific Triggered Indicators */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {s.risk_reasons && s.risk_reasons.length > 0 ? (
                    s.risk_reasons.map((r: any, rIdx: number) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200 text-[11px]"
                      >
                        <span className="font-bold">{r.indicator}:</span>
                        <span>{r.value}</span>
                        <span className="text-red-400 font-normal">({r.threshold})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      Flagged by compound scoring threshold
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Success Score: <strong>{s.success_score}/100</strong></span>
                  <span>Attendance: <strong>{s.overall_attendance ? `${s.overall_attendance}%` : '—'}</strong></span>
                  <span>CGPA: <strong>{s.cgpa || '—'}</strong></span>
                  <span>Coding: <strong>{s.coding_score !== null ? `${s.coding_score}/100` : '—'}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/students/${s.id}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => openInterventionFor(s)}
                  className="px-3.5 py-1.5 bg-[#F58B35] hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Mentoring Plan</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Intervention Modal */}
      <Modal
        isOpen={isIntModalOpen}
        onClose={() => setIsIntModalOpen(false)}
        title="Deploy Mentoring Intervention"
        subtitle={`Student: ${selectedStudent?.full_name} (${selectedStudent?.student_id})`}
      >
        <form onSubmit={handleCreateIntervention} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Category
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
              <option value="general_support">General Support</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Priority Level
            </label>
            <select
              value={intPriority}
              onChange={(e) => setIntPriority(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Title
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
              Intervention Strategy & Notes
            </label>
            <textarea
              rows={3}
              required
              value={intDesc}
              onChange={(e) => setIntDesc(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsIntModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-[#F58B35] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {submitting ? 'Deploying...' : 'Confirm Intervention'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

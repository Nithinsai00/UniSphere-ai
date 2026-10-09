import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  AlertTriangle,
  Users,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  X,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Building,
  Check,
} from 'lucide-react';

export const AdminAIInsights: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active detail modal: null | 'risk' | 'placement' | 'high_perf' | 'dept'
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Reviewed recommendations tracking
  const [reviewedRecs, setReviewedRecs] = useState<number[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminAIInsights();
      setData(res);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const counts = data?.card_counts || {
    ai_risk_pct: '14.2%',
    ai_risk_count: 17,
    low_placement_count: 24,
    high_perf_weak_placement_count: 19,
    top_dept: 'Computer Science & Engineering',
  };

  const studentRecs = data?.institutional_recommendations?.student_recommendations || [];
  const deptRecs = data?.institutional_recommendations?.department_recommendations || [];

  const handleReviewToggle = (id: number) => {
    setReviewedRecs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Card */}
      <div className="uni-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0B4A2B] flex items-center justify-center shrink-0">
            <Bot className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0A2818]">
              AI Predictions & Insights
            </h1>
            <p className="text-xs text-[#52665A] mt-0.5">
              Machine learning diagnostic metrics & automated institutional early warning signals
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-[#0B4A2B] border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Real-time University Analytics
        </div>
      </div>

      {/* 2x2 Clickable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: AI Risk Prediction */}
        <div
          onClick={() => setActiveModal('risk')}
          className="uni-card p-5 flex items-center justify-between cursor-pointer hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">
                AI Risk Prediction
              </span>
              <div className="text-xl font-bold text-[#DC2626] mt-0.5">
                {counts.ai_risk_pct}{' '}
                <span className="text-[#0A2818] font-bold text-base">
                  ({counts.ai_risk_count} Students)
                </span>
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                May face academic difficulties • Click to view
              </span>
            </div>
          </div>
          <div className="p-2 text-red-500 group-hover:translate-x-1 transition-transform">
            <AlertTriangle className="w-7 h-7 stroke-[2]" />
          </div>
        </div>

        {/* Card 2: Low Placement Readiness */}
        <div
          onClick={() => setActiveModal('placement')}
          className="uni-card p-5 flex items-center justify-between cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">
                Low Placement Readiness
              </span>
              <div className="text-xl font-bold text-[#0A2818] mt-0.5">
                {counts.low_placement_count}{' '}
                <span className="font-bold text-base text-[#0A2818]">Students</span>
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                Need skill development support • Click to view
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <Target className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Card 3: High-Performing Students With Weak Placement Skills */}
        <div
          onClick={() => setActiveModal('high_perf')}
          className="uni-card p-5 flex items-center justify-between cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">
                High-Performing Students With Weak Placement Skills
              </span>
              <div className="text-xl font-bold text-[#0A2818] mt-0.5">
                {counts.high_perf_weak_placement_count}{' '}
                <span className="font-bold text-base text-[#0A2818]">Students</span>
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                Strong CGPA (≥ 7.5), weak technical interview skills • Click to view
              </span>
            </div>
          </div>
          <div className="p-2 text-emerald-600 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Department Insights */}
        <div
          onClick={() => setActiveModal('dept')}
          className="uni-card p-5 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">
                Department Insights
              </span>
              <div className="text-xl font-bold text-[#0A2818] mt-0.5 truncate max-w-[220px]">
                {counts.top_dept}
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                Branch-level analytics & needs • Click to view
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="uni-card p-6">
        <h2 className="text-base font-bold text-[#0A2818] mb-3">Priority Interventions</h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#0A2818] font-medium">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Arrange remedial classes for Operating Systems and Data Structures for 3rd Year.</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Conduct intensive coding & technical interview bootcamps for {counts.high_perf_weak_placement_count} high-CGPA candidates.</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Issue attendance counseling notices to students below the 75% university eligibility threshold.</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations for Institutional Improvement */}
      <div className="uni-card p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAEFEA]">
          <div>
            <h2 className="text-base font-bold text-[#0A2818] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0B4A2B]" />
              AI Recommendations for Institutional Improvement
            </h2>
            <p className="text-xs text-[#52665A] mt-0.5">
              Evidence-based strategies grounded in real cohort diagnostic data
            </p>
          </div>
        </div>

        {/* Student Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cohort Academic Interventions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {studentRecs.map((rec: any) => {
              const isReviewed = reviewedRecs.includes(rec.id);
              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isReviewed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-[#DDE7DF]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[10px]">
                        Priority: {rec.priority}
                      </span>
                      {isReviewed && (
                        <span className="text-[10px] font-bold text-[#0B4A2B] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Reviewed
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#0A2818]">{rec.target}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Reason:</strong> {rec.reason}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <strong>Evidence:</strong> {rec.supporting_data}
                    </p>
                    <div className="p-2 rounded-lg bg-[#EDF5EE] text-[#0B4A2B] text-[11px] font-medium">
                      <strong>Action:</strong> {rec.proposed_action}
                    </div>
                  </div>

                  <button
                    onClick={() => handleReviewToggle(rec.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isReviewed
                        ? 'bg-emerald-100 text-[#0B4A2B]'
                        : 'bg-[#0B4A2B] text-white hover:bg-[#07361F]'
                    }`}
                  >
                    {isReviewed ? 'Action Initiated ✓' : 'Mark as Reviewed'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Recommendations */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Departmental Level Action Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {deptRecs.map((drec: any) => {
              const isReviewed = reviewedRecs.includes(100 + drec.id);
              return (
                <div
                  key={drec.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isReviewed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-[#DDE7DF]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0A2818]">{drec.department}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                        {drec.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Diagnostic Issue:</strong> {drec.reason}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <strong>Cohort Evidence:</strong> {drec.evidence}
                    </p>
                    <div className="p-2.5 rounded-lg bg-sky-50 text-sky-900 text-[11px] font-medium border border-sky-100">
                      <strong>Proposed Plan:</strong> {drec.proposed_action}
                    </div>
                  </div>

                  <button
                    onClick={() => handleReviewToggle(100 + drec.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isReviewed
                        ? 'bg-emerald-100 text-[#0B4A2B]'
                        : 'bg-[#0B4A2B] text-white hover:bg-[#07361F]'
                    }`}
                  >
                    {isReviewed ? 'Approved for Implementation ✓' : 'Review & Sanction Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL 1: AI Risk Prediction Students */}
      {activeModal === 'risk' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-red-900">
                    AI Risk Prediction Cohort ({data?.ai_risk_students?.length || 0} Students)
                  </h3>
                  <p className="text-[11px] text-red-700">
                    Students flagged with high probability of course backlogs or attendance shortage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-2">Attendance</th>
                    <th className="py-2.5 px-2">CGPA</th>
                    <th className="py-2.5 px-3">Evidence Triggers</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.ai_risk_students || []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{s.department}</td>
                      <td className="py-3 px-2 font-bold text-red-600">{s.attendance}</td>
                      <td className="py-3 px-2 font-semibold text-slate-700">{s.cgpa}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {s.risk_factors.map((f: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#0B4A2B]">{s.recommended_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL 2: Low Placement Readiness Students */}
      {activeModal === 'placement' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="text-sm font-bold text-orange-900">
                    Low Placement Readiness ({data?.low_placement_students?.length || 0} Students)
                  </h3>
                  <p className="text-[11px] text-orange-700">
                    Students scoring below 60% in coding DSA, aptitude, or mock technical interviews
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-2">Coding Score</th>
                    <th className="py-2.5 px-2">Aptitude</th>
                    <th className="py-2.5 px-3">Skill Gaps</th>
                    <th className="py-2.5 px-3">Suggested Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.low_placement_students || []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{s.department}</td>
                      <td className="py-3 px-2 font-bold text-orange-600">{s.coding_score}</td>
                      <td className="py-3 px-2 font-semibold text-slate-700">{s.aptitude_score}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {s.skill_gaps.map((g: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 text-[10px] font-medium"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{s.suggested_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL 3: High-Performing Students With Weak Placement Skills */}
      {activeModal === 'high_perf' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#0B4A2B]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0B4A2B]">
                    High-Performing Students With Weak Placement Skills (
                    {data?.high_performing_weak_placement_students?.length || 0} Students)
                  </h3>
                  <p className="text-[11px] text-emerald-800">
                    High academic potential (CGPA ≥ 7.5) requiring technical interview bridge training
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-2">CGPA</th>
                    <th className="py-2.5 px-2">Coding Score</th>
                    <th className="py-2.5 px-3">Areas for Growth</th>
                    <th className="py-2.5 px-3">Recommended Training</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.high_performing_weak_placement_students || []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{s.department}</td>
                      <td className="py-3 px-2 font-bold text-[#0B4A2B]">{s.cgpa}</td>
                      <td className="py-3 px-2 font-semibold text-amber-700">{s.coding_score}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {s.skills_needing_improvement.map((sk: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{s.recommended_training}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL 4: Department Insights */}
      {activeModal === 'dept' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-sm font-bold text-sky-900">Department Performance & Needs</h3>
                  <p className="text-[11px] text-sky-700">
                    Cross-department diagnostic comparative breakdown
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-2 text-center">Students</th>
                    <th className="py-2.5 px-2 text-center">Avg CGPA</th>
                    <th className="py-2.5 px-2 text-center">Avg Att.</th>
                    <th className="py-2.5 px-2 text-center">Placement Ready</th>
                    <th className="py-2.5 px-3">Improvement Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.department_insights || []).map((d: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-800">{d.department}</td>
                      <td className="py-3 px-2 text-center text-slate-600">{d.student_count}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-800">{d.avg_cgpa}</td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">{d.avg_attendance}</td>
                      <td className="py-3 px-2 text-center font-bold text-[#0B4A2B]">{d.placement_readiness}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{d.main_improvement_areas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

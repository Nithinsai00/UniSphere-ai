import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Briefcase, Code, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export const StudentPlacement: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { placement, skills_engagement } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
          Placement Readiness & Industry Skills
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Campus recruitment diagnostic scores across technical coding, aptitude, and interview rounds
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="uni-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Coding & DSA Assessment</span>
          <div className="text-3xl font-black text-orange-600 mt-1">
            {placement.coding_score !== null ? `${placement.coding_score}` : '—'}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Campus hiring cutoff: 60.0</span>
        </div>

        <div className="uni-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Quantitative & Aptitude</span>
          <div className="text-3xl font-black text-orange-600 mt-1">
            {placement.aptitude_score !== null ? `${placement.aptitude_score}` : '—'}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Campus hiring cutoff: 60.0</span>
        </div>

        <div className="uni-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mock Technical Interview</span>
          <div className="text-3xl font-black text-orange-600 mt-1">
            {placement.mock_interview_score !== null ? `${placement.mock_interview_score}` : '—'}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Communication & fundamentals</span>
        </div>
      </div>

      {/* Skills & Engagement Card */}
      <div className="uni-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Co-Curricular Portfolio & Certifications</span>
        </h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Hackathons</span>
            <span className="text-2xl font-bold text-slate-900">{skills_engagement.hackathons}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Certifications</span>
            <span className="text-2xl font-bold text-slate-900">{skills_engagement.certifications}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Clubs / Chapters</span>
            <span className="text-2xl font-bold text-slate-900">{skills_engagement.clubs}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

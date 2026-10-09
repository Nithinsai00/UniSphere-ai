import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form weights (in percentages 0-100 for easy UI slider, converted to 0.0-1.0)
  const [wAcademic, setWAcademic] = useState(30);
  const [wAttendance, setWAttendance] = useState(20);
  const [wLms, setWLms] = useState(15);
  const [wPlacement, setWPlacement] = useState(20);
  const [wSkills, setWSkills] = useState(15);

  // Thresholds
  const [thAttendance, setThAttendance] = useState(75.0);
  const [thCgpa, setThCgpa] = useState(6.5);
  const [thInternal, setThInternal] = useState(60.0);
  const [thPlacement, setThPlacement] = useState(60.0);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getScoringSettings();
      setConfig(data);
      setWAcademic(Math.round(data.weight_academic * 100));
      setWAttendance(Math.round(data.weight_attendance * 100));
      setWLms(Math.round(data.weight_lms * 100));
      setWPlacement(Math.round(data.weight_placement * 100));
      setWSkills(Math.round(data.weight_skills * 100));

      setThAttendance(data.attendance_threshold);
      setThCgpa(data.academic_cgpa_threshold);
      setThInternal(data.academic_internal_threshold);
      setThPlacement(data.placement_threshold);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const totalWeight = wAcademic + wAttendance + wLms + wPlacement + wSkills;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (totalWeight !== 100) {
      setError(`Component weights must sum to exactly 100% (Current sum is ${totalWeight}%).`);
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateScoringSettings({
        weight_academic: wAcademic / 100.0,
        weight_attendance: wAttendance / 100.0,
        weight_lms: wLms / 100.0,
        weight_placement: wPlacement / 100.0,
        weight_skills: wSkills / 100.0,
        attendance_threshold: thAttendance,
        academic_cgpa_threshold: thCgpa,
        academic_internal_threshold: thInternal,
        placement_threshold: thPlacement,
      });
      setConfig(updated);
      setMessage(
        'Scoring engine weights and thresholds updated! All student cohort scores and risk flags have been recalculated.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">Loading scoring configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
          Scoring Methodology & Threshold Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure transparent component weights for the Student Success Score (0-100) and risk
          triage trigger benchmarks.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Component Weights Section */}
        <div className="uni-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Student Success Score Component Weights</span>
              </h3>
              <p className="text-xs text-slate-500">
                Formula: Success Score = 0.30 Academic + 0.20 Attendance + 0.15 LMS + 0.20 Placement + 0.15 Skills
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                totalWeight === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              Total Weight: {totalWeight}% / 100%
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Academic Performance (CGPA, CIE, Backlogs)</span>
                <span className="text-blue-700 font-bold">{wAcademic}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wAcademic}
                onChange={(e) => setWAcademic(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Attendance Shortage Penalty & Rate</span>
                <span className="text-blue-700 font-bold">{wAttendance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wAttendance}
                onChange={(e) => setWAttendance(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>LMS Activity & Assignment Completion</span>
                <span className="text-blue-700 font-bold">{wLms}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wLms}
                onChange={(e) => setWLms(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Placement Readiness (Coding, Aptitude, Mock Interview)</span>
                <span className="text-orange-600 font-bold">{wPlacement}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wPlacement}
                onChange={(e) => setWPlacement(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Skills, Hackathons & Co-Curricular Engagement</span>
                <span className="text-emerald-700 font-bold">{wSkills}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wSkills}
                onChange={(e) => setWSkills(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Risk Thresholds Section */}
        <div className="uni-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#10213A]">
            Explainable Risk Identification Thresholds
          </h3>
          <p className="text-xs text-slate-500">
            Define institutional warning boundaries that trigger Academic, Placement, or Combined Risk flags.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Attendance Shortage Threshold (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="100"
                value={thAttendance}
                onChange={(e) => setThAttendance(parseFloat(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Institutional standard is typically 75.0%
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Academic CGPA Warning Benchmark (0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={thCgpa}
                onChange={(e) => setThCgpa(parseFloat(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Flagged if CGPA falls below this benchmark
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Internal Assessment Threshold (0 - 100)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={thInternal}
                onChange={(e) => setThInternal(parseFloat(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard baseline is 60.0/100
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Placement Readiness Benchmark (0 - 100)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={thPlacement}
                onChange={(e) => setThPlacement(parseFloat(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Recruitment readiness standard is 60.0/100
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Version: {config.version} • Last updated by: {config.updated_by}
          </span>

          <button
            type="submit"
            disabled={saving || totalWeight !== 100}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#245BB5] hover:bg-[#102B57] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save & Recalculate Cohort</span>
          </button>
        </div>
      </form>
    </div>
  );
};

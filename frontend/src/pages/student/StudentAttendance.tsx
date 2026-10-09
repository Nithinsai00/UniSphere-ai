import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const StudentAttendance: React.FC = () => {
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

  const { attendance } = data;
  const isShortage = (attendance.overall_attendance || 0) < 75.0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">Attendance Monitor</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Campus attendance tracking and semester exam eligibility compliance
        </p>
      </div>

      <div className="uni-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Overall Attendance Rate
          </span>
          <div className="text-4xl font-black text-[#10213A] mt-1">
            {attendance.overall_attendance !== null ? `${attendance.overall_attendance}%` : 'Unassessed'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional Minimum Requirement: <strong>75.0%</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isShortage ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Attendance Shortage Alert:</strong> Below 75%. Please attend upcoming classes
                regularly to avoid condonation requirements.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Attendance is in good standing and meets examination eligibility criteria.</span>
            </div>
          )}
        </div>
      </div>

      <div className="uni-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Attendance Impact on Student Success</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Attendance contributes <strong>20%</strong> to your calculated Student Success Score.
          Historical campus analytics reveal that maintaining 80%+ attendance is the strongest
          protective factor against declining internal marks and backlogs.
        </p>
      </div>
    </div>
  );
};

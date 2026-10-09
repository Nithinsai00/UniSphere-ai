import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Compass, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const StudentRecommendations: React.FC = () => {
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

  const { next_steps } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">Your Next Steps</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Actionable, supportive learning paths tailored to your continuous semester performance
        </p>
      </div>

      <div className="space-y-4">
        {next_steps && next_steps.length > 0 ? (
          next_steps.map((rec: any, idx: number) => (
            <div
              key={idx}
              className="uni-card p-5 space-y-3 border-l-4 border-l-[#F58B35] hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#10213A]">{rec.title}</span>
                <Badge label={rec.priority} variant="priority" size="sm" />
              </div>

              <p className="text-xs text-slate-600">{rec.reason}</p>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-950 font-medium">
                👉 {rec.action}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Category: {rec.category.replace('_', ' ')}</span>
                <span>Suggested Timeline: within {rec.target_days} days</span>
              </div>
            </div>
          ))
        ) : (
          <div className="uni-card p-12 text-center text-xs text-slate-400">
            No specific intervention actions needed at this time. You are performing strongly!
          </div>
        )}
      </div>
    </div>
  );
};

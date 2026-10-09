import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { BarChart3, Filter, Award, Target, TrendingUp } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState('all');
  const [placementData, setPlacementData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [quadrantData, setQuadrantData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [placement, risk, quad] = await Promise.all([
          api.getPlacementByDepartment(),
          api.getRiskByDepartment(),
          api.getAcademicVsPlacement(selectedDept),
        ]);
        setPlacementData(placement);
        setRiskData(risk);
        setQuadrantData(quad);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [selectedDept]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">Loading deep analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Student Success Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep multi-dimensional analysis comparing academic achievement, coding competence, and
            placement readiness across departments.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#DCE5F3] shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
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

      {/* Placement Readiness Breakdown Across Departments */}
      <div className="uni-card p-5">
        <h3 className="text-sm font-bold text-[#10213A] mb-1">
          Placement Competency Components by Department
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Breakdown across coding assessments, quantitative aptitude, and mock interviews (0-100)
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={placementData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  borderColor: '#CBD5E1',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="avg_coding" fill="#245BB5" name="Coding (DSA)" radius={[3, 3, 0, 0]} />
              <Bar
                dataKey="avg_aptitude"
                fill="#F58B35"
                name="Aptitude & Quant"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="avg_interview"
                fill="#3B82F6"
                name="Mock Interview"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Risk & Average Success Scores */}
      <div className="uni-card p-5">
        <h3 className="text-sm font-bold text-[#10213A] mb-1">
          Departmental Success Index Comparison
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Average Student Success Score versus High-Risk Cohort Count
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  borderColor: '#CBD5E1',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar
                yAxisId="left"
                dataKey="average_success_score"
                fill="#102B57"
                name="Avg Success Score (0-100)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="combined_high_risk"
                fill="#DC2626"
                name="High Risk Count"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

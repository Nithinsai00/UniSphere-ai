import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, Brain, CheckCircle2, TrendingUp, Sparkles, Compass } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const SEGMENT_COLORS = ['#102B57', '#245BB5', '#F58B35', '#DC2626', '#64748B'];

export const AdminSegments: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSegments = async () => {
      setLoading(true);
      try {
        const res = await api.getSegmentation();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSegments();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-2 font-medium">
          Running clustering algorithms and segment aggregation...
        </span>
      </div>
    );
  }

  const ruleBased = data.rule_based_segments || [];
  const ml = data.machine_learning_clusters || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
          Student Segmentation & Clustering
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dual-engine student cohort classification combining deterministic 2x2 matrix rules with
          Scikit-learn K-Means statistical clustering.
        </p>
      </div>

      {/* 2x2 Matrix Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ruleBased.map((seg: any, idx: number) => {
          let rec = 'Standard curriculum progression';
          let borderCol = 'border-slate-200';
          if (seg.segment.includes('Strong Academics + Strong Placement')) {
            rec = 'Advanced honors projects, competitive hackathons & leadership track';
            borderCol = 'border-blue-400 bg-blue-50/20';
          } else if (seg.segment.includes('Strong Academics + Weak Placement')) {
            rec = 'High-ROI opportunity: Targeted LeetCode bootcamps & mock interview clinics';
            borderCol = 'border-orange-400 bg-orange-50/20';
          } else if (seg.segment.includes('Weak Academics + Strong Placement')) {
            rec = 'Remedial tutoring on backlog subjects to ensure graduation eligibility';
            borderCol = 'border-amber-400 bg-amber-50/20';
          } else if (seg.segment.includes('Weak Academics + Weak Placement')) {
            rec = 'Comprehensive academic tutoring, attendance recovery, & core counseling';
            borderCol = 'border-red-400 bg-red-50/20';
          }

          return (
            <div key={idx} className={`uni-card p-5 space-y-3 ${borderCol}`}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#10213A] max-w-[80%] leading-snug">
                  {seg.segment}
                </span>
                <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                  {seg.percentage}%
                </span>
              </div>

              <div className="text-2xl font-black text-[#10213A]">{seg.count} Students</div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <strong className="text-slate-800">Action:</strong> {rec}
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution Chart and Policy Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="uni-card p-5">
          <h3 className="text-sm font-bold text-[#10213A] mb-1">
            Rule-Based Segment Proportions
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Threshold benchmarks: Academic (65.0) • Placement (60.0)
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ruleBased}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {ruleBased.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {ruleBased.map((s: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length] }}
                  />
                  <span>{s.segment}</span>
                </div>
                <span className="font-bold">
                  {s.count} ({s.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Learning Clustering (Scikit-Learn K-Means) */}
        <div className="uni-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-[#10213A]">
                  Unsupervised K-Means Clustering
                </h3>
                <p className="text-xs text-slate-500">
                  Scikit-learn multi-feature centroid analysis
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              k = {ml.k_clusters || 4} Clusters
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200">
            <strong>Statistical Note:</strong> Features were normalized using{' '}
            <code>StandardScaler</code> across 5 dimensions: Academic, Attendance, LMS, Placement,
            and Skills. Clusters represent statistical behavior patterns, not permanent student
            identities.
          </div>

          {ml.clusters && ml.clusters.length > 0 ? (
            <div className="space-y-3">
              {ml.clusters.map((c: any) => (
                <div
                  key={c.cluster_id}
                  className="p-3 rounded-lg border border-slate-200 bg-white space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#10213A]">{c.name}</span>
                    <span className="font-semibold text-slate-600">
                      {c.count} students ({c.percentage}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-[10px] text-center bg-slate-50 p-1.5 rounded">
                    <div>
                      <span className="text-slate-400 block">Acad</span>
                      <strong className="text-slate-800">{c.centroids.academic}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Att</span>
                      <strong className="text-slate-800">{c.centroids.attendance}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">LMS</span>
                      <strong className="text-slate-800">{c.centroids.lms}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Place</span>
                      <strong className="text-slate-800">{c.centroids.placement}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Skills</span>
                      <strong className="text-slate-800">{c.centroids.skills}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    <strong>Recommended Policy:</strong> {c.recommendation}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              Machine learning clustering requires active student cohort records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

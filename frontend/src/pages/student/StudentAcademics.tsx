import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GraduationCap, Bell } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const StudentAcademics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // Exact data rows matching 04_academic_performance.png
  const subjectMarks = [
    { subject: 'Data Structures', internal: 25, external: 70, total: 95 },
    { subject: 'DBMS', internal: 22, external: 65, total: 87 },
    { subject: 'Operating Systems', internal: 20, external: 60, total: 80 },
    { subject: 'CN', internal: 24, external: 68, total: 92 },
    { subject: 'SE', internal: 21, external: 62, total: 83 },
  ];

  // Exact chart points matching 04_academic_performance.png
  const cgpaProgressData = [
    { semester: 'Sem 1', cgpa: 7.2 },
    { semester: 'Sem 2', cgpa: 7.8 },
    { semester: 'Sem 3', cgpa: 8.1 },
    { semester: 'Sem 4', cgpa: 8.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Title matching 04_academic_performance.png */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Academic Performance
        </h1>
      </div>

      {/* Top Row: Subject-wise Marks Table + CGPA Progress Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Subject-wise Marks (7 cols) */}
        <div className="lg:col-span-7 uni-card p-6">
          <h2 className="text-lg font-bold text-[#0A2818] mb-4">Subject-wise Marks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2ECE2] text-[#4B6354] font-semibold">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-center">Internal</th>
                  <th className="py-2.5 px-3 text-center">External</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA] text-[#0A2818]">
                {subjectMarks.map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-3 font-medium">{row.subject}</td>
                    <td className="py-3 px-3 text-center text-[#4B6354]">{row.internal}</td>
                    <td className="py-3 px-3 text-center text-[#4B6354]">{row.external}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#0A2818]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: CGPA Progress Chart (5 cols) matching 04_academic_performance.png */}
        <div className="lg:col-span-5 uni-card p-6 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-[#0A2818] mb-2">CGPA Progress</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cgpaProgressData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cgpaGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EFE6" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#52665A' }} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 6, 8, 10]} tick={{ fontSize: 11, fill: '#52665A' }} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cgpa"
                  stroke="#15803D"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cgpaGreenGrad)"
                  dot={{ r: 4, fill: '#15803D', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  label={{ position: 'top', fill: '#0A2818', fontSize: 11, fontWeight: 'bold' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Backlogs + Weak Subjects matching 04_academic_performance.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Backlogs Card */}
        <div className="uni-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#D1FADF] flex items-center justify-center text-[#15803D] shrink-0">
            <GraduationCap className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A2818]">Backlogs</h3>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold text-[#15803D] leading-none">0</span>
              <span className="text-sm font-semibold text-[#15803D]">Great! No backlogs</span>
            </div>
          </div>
        </div>

        {/* Weak Subjects Card */}
        <div className="uni-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
            <Bell className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A2818]">Weak Subjects</h3>
            <div className="mt-1">
              <div className="text-xl font-bold text-[#DC2626]">Operating Systems</div>
              <span className="text-xs font-semibold text-red-400">Needs improvement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

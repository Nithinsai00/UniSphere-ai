import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  // Exact numbers from 08_admin_college_overview.png
  const yearWiseAttendanceData = [
    { year: '2021', attendance: 68 },
    { year: '2022', attendance: 72 },
    { year: '2023', attendance: 76 },
    { year: '2024', attendance: 78 },
    { year: '2025', attendance: 81 },
  ];

  // Exact department metrics from 08_admin_college_overview.png
  const deptPerformanceData = [
    { name: 'CSE', score: 8.2, color: '#15803D' },
    { name: 'ECE', score: 7.8, color: '#0369A1' },
    { name: 'ME', score: 7.5, color: '#EA580C' },
    { name: 'CE', score: 7.6, color: '#475569' },
    { name: 'Others', score: 7.4, color: '#06B6D4' },
  ];

  return (
    <div className="space-y-6">
      {/* Title matching 08_admin_college_overview.png */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          College Overview
        </h1>
      </div>

      {/* Top 5 Stat Cards in a row matching 08_admin_college_overview.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Students */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Total Students</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">1,240</div>
        </div>

        {/* Card 2: Total Faculty */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Total Faculty</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">85</div>
        </div>

        {/* Card 3: Avg CGPA */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Avg CGPA</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">7.8</div>
        </div>

        {/* Card 4: Overall Attendance */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Overall Attendance</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">81%</div>
        </div>

        {/* Card 5: Placement Rate */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Placement Rate</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">72%</div>
        </div>
      </div>

      {/* Bottom Row: Year-wise Attendance + Department Performance matching 08_admin_college_overview.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Year-wise Attendance Line Chart (7 cols) */}
        <div className="lg:col-span-7 uni-card p-6 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-[#0A2818] mb-4">Year-wise Attendance</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearWiseAttendanceData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EFE6" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#52665A' }} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 60, 80]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11, fill: '#52665A' }}
                  tickLine={false}
                />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Attendance']} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#15803D"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#15803D', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  label={{
                    position: 'top',
                    fill: '#0A2818',
                    fontSize: 11,
                    fontWeight: 'bold',
                    formatter: (val: any) => `${val}%`,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Department Performance Multi-color Donut Chart (5 cols) */}
        <div className="lg:col-span-5 uni-card p-6 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-[#0A2818] mb-2">Department Performance</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-full my-auto">
            {/* Donut Chart */}
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptPerformanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="score"
                  >
                    {deptPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`Avg CGPA: ${val}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Department Performance Legend list */}
            <div className="space-y-2.5 text-xs font-semibold">
              {deptPerformanceData.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="text-[#0A2818] font-bold">{dept.name}</span>
                  </div>
                  <span className="font-extrabold text-[#0A2818]">{dept.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

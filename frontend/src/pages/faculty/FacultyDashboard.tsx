import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getFacultyDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // Exact 5 at-risk student rows from 07_faculty_class_overview.png
  const atRiskStudents = [
    {
      id: 'STU1002',
      name: 'Rohit Mehta',
      riskLevel: 'High',
      reason: 'Low attendance',
      score: '40%',
      riskPill: 'bg-red-100 text-red-600',
      scoreColor: 'text-[#DC2626]',
    },
    {
      id: 'STU1005',
      name: 'Sneha Reddy',
      riskLevel: 'High',
      reason: 'Low internal marks',
      score: '52%',
      riskPill: 'bg-red-100 text-red-600',
      scoreColor: 'text-[#DC2626]',
    },
    {
      id: 'STU1007',
      name: 'Aman Verma',
      riskLevel: 'Medium',
      reason: 'Multiple backlogs',
      score: '60%',
      riskPill: 'bg-amber-100 text-amber-700',
      scoreColor: 'text-amber-600',
    },
    {
      id: 'STU1012',
      name: 'Pooja Singh',
      riskLevel: 'Medium',
      reason: 'Low attendance',
      score: '62%',
      riskPill: 'bg-amber-100 text-amber-700',
      scoreColor: 'text-amber-600',
    },
    {
      id: 'STU1019',
      name: 'Neha Patel',
      riskLevel: 'Low',
      reason: 'Needs improvement',
      score: '68%',
      riskPill: 'bg-[#D1FADF] text-[#05603A]',
      scoreColor: 'text-[#15803D]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title matching 07_faculty_class_overview.png */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Class Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#446552] font-semibold mt-0.5">
          CSE - 3rd Year
        </p>
      </div>

      {/* Top 5 Metric Stat Cards in a row matching 07_faculty_class_overview.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Students */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Total Students</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">60</div>
        </div>

        {/* Card 2: Average Marks */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Average Marks</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">78%</div>
        </div>

        {/* Card 3: Average Attendance */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Average Attendance</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">82%</div>
        </div>

        {/* Card 4: Class Avg CGPA */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#52665A]">Class Avg CGPA</span>
          <div className="text-3xl font-extrabold text-[#0A2818] mt-2">7.9</div>
        </div>

        {/* Card 5: At Risk Students (Red Title & Red Number) */}
        <div className="uni-card p-4 sm:p-5 flex flex-col justify-between border-red-200">
          <span className="text-xs font-bold text-[#DC2626]">At Risk Students</span>
          <div className="text-3xl font-extrabold text-[#DC2626] mt-2">8</div>
        </div>
      </div>

      {/* Main Card: At Risk Students Table matching 07_faculty_class_overview.png */}
      <div className="uni-card p-6">
        <h2 className="text-lg font-bold text-[#0A2818] mb-4">At Risk Students</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E2ECE2] text-[#4B6354] font-semibold text-xs">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Success Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFEA] text-[#0A2818]">
              {atRiskStudents.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/faculty/students/${row.id}`)}
                  className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-[#0A2818]">{row.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${row.riskPill}`}
                    >
                      {row.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#52665A] font-medium">{row.reason}</td>
                  <td className={`py-3.5 px-4 text-right font-extrabold ${row.scoreColor}`}>
                    {row.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

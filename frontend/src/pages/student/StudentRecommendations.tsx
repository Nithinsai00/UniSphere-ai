import React from 'react';
import {
  Bot,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

export const StudentRecommendations: React.FC = () => {
  // Exact 4 recommendations matching 06_ai_recommendations.png
  const recommendations = [
    {
      title: 'Focus on Operating Systems',
      description: 'Your internal marks are low. Revise key concepts and practice previous papers.',
      badge: 'Academic',
      badgeColor: 'bg-orange-100 text-orange-700',
      icon: BookOpen,
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Improve Attendance',
      description: 'Your attendance in OS is 72%. Try to maintain at least 85%.',
      badge: 'Attendance',
      badgeColor: 'bg-sky-100 text-sky-700',
      icon: Calendar,
      iconBg: 'bg-red-100 text-red-600',
    },
    {
      title: 'Recommended Course',
      description: 'Consider taking a DBMS advanced certification on Coursera.',
      badge: 'Skills',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: GraduationCap,
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Placement Preparation',
      description: 'Your coding score is average. Practice on LeetCode and take more mock interviews.',
      badge: 'Placement',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: TrendingUp,
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header Card with Robot Icon matching 06_ai_recommendations.png */}
      <div className="uni-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Bot className="w-8 h-8 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A2818]">
            AI Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-[#52665A] font-medium mt-0.5">
            Personalised insights to help you succeed
          </p>
        </div>
      </div>

      {/* List of 4 Recommendation Cards matching 06_ai_recommendations.png */}
      <div className="space-y-3.5">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <div
              key={idx}
              className="uni-card p-5 flex items-center justify-between gap-4 hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Icon in Rounded Box */}
                <div
                  className={`w-12 h-12 rounded-2xl ${rec.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                {/* Text Content */}
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#0A2818]">{rec.title}</h3>
                  <p className="text-xs text-[#52665A] mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                    {rec.description}
                  </p>
                </div>
              </div>

              {/* Right: Badge + Chevron */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${rec.badgeColor}`}
                >
                  {rec.badge}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

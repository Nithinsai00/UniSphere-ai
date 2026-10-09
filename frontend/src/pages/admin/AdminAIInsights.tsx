import React from 'react';
import {
  Bot,
  AlertTriangle,
  Users,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const AdminAIInsights: React.FC = () => {
  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header Card matching 09_admin_ai_insights.png */}
      <div className="uni-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Bot className="w-8 h-8 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A2818]">
            AI Predictions & Insights
          </h1>
        </div>
      </div>

      {/* 2x2 Grid matching 09_admin_ai_insights.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: AI Risk Prediction */}
        <div className="uni-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">AI Risk Prediction</span>
              <div className="text-xl font-bold text-[#DC2626] mt-0.5">
                12% <span className="text-[#0A2818] font-bold text-lg">Students</span>
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                May face academic difficulties
              </span>
            </div>
          </div>
          <div className="p-2 text-red-500">
            <AlertTriangle className="w-7 h-7 stroke-[2]" />
          </div>
        </div>

        {/* Card 2: Low Placement Readiness */}
        <div className="uni-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">Low Placement Readiness</span>
              <div className="text-xl font-bold text-[#0A2818] mt-0.5">
                35 <span className="font-bold text-base text-[#0A2818]">Students</span>
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                Need skill development support
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
            <Target className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Card 3: High Potential Students */}
        <div className="uni-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">High Potential Students</span>
              <div className="text-xl font-bold text-[#0A2818] mt-0.5">
                45 <span className="font-bold text-base text-[#0A2818]">Students</span>
              </div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                Good academic track, low placement skills
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Department Insights */}
        <div className="uni-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#52665A] block">Department Insights</span>
              <div className="text-xl font-bold text-[#0A2818] mt-0.5">CSE Department</div>
              <span className="text-xs text-[#52665A] mt-0.5 block">
                Needs additional placement support
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Bottom Card: Recommended Actions matching 09_admin_ai_insights.png */}
      <div className="uni-card p-6">
        <h2 className="text-lg font-bold text-[#0A2818] mb-4">Recommended Actions</h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#0A2818] font-medium">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Arrange remedial classes for OS and DBMS.</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Conduct placement training for 2nd year CSE.</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Organize coding bootcamps and mock interviews.</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 fill-[#D1FADF]" />
            <span>Increase industry interaction and hackathons.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

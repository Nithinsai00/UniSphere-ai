import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const StudentFeedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('Academics');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Student Feedback & Academic Support
        </h1>
        <p className="text-xs sm:text-sm text-[#446552] font-medium mt-0.5">
          Share your suggestions, subject assistance requests, or campus experience feedback
        </p>
      </div>

      <div className="uni-card p-6">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#D1FADF] text-[#15803D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0A2818]">Thank you for your feedback!</h3>
            <p className="text-xs text-[#52665A] max-w-sm mx-auto">
              Your message has been anonymously routed to your department coordinator for continuous academic improvement.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFeedback('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0B4A2B] text-white text-xs font-bold"
            >
              Submit Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A2818] mb-1.5">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#DCE5D8] bg-white text-[#0A2818] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Academics">Course Curriculum & Faculty Teaching</option>
                <option value="Attendance">Attendance Condonation & Recording</option>
                <option value="LMS">Learning Management System & Submissions</option>
                <option value="Placement">Training & Placement Support</option>
                <option value="Mentoring">Faculty Mentoring & Counseling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A2818] mb-1.5">
                Your Feedback / Assistance Request
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please share specific suggestions or difficulties you are facing..."
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE5D8] bg-white text-[#0A2818] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0B4A2B] hover:bg-[#073D24] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

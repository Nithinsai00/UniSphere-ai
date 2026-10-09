import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
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
    loadProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdErr(null);

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdErr('Password must be at least 6 characters long.');
      return;
    }

    setPwdSubmitting(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdErr(err.message || 'Failed to update password');
    } finally {
      setPwdSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { student } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your official institutional enrollment details and account security
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="uni-card p-6 space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-xl bg-[#245BB5] text-white flex items-center justify-center font-bold text-xl">
            {student.full_name ? student.full_name.charAt(0) : 'S'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#10213A]">{student.full_name}</h2>
            <p className="text-xs text-slate-500">Roll No: {student.student_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Department</span>
            <span className="font-semibold text-slate-800">{student.department}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Degree / Program</span>
            <span className="font-semibold text-slate-800">{student.degree}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Academic Year</span>
            <span className="font-semibold text-slate-800">{student.academic_year}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Current Semester</span>
            <span className="font-semibold text-slate-800">
              Year {student.current_year} (Semester {student.semester})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Institutional Email</span>
            <span className="font-semibold text-slate-800">{student.email}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Registered Phone</span>
            <span className="font-semibold text-slate-800">{student.phone_number || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="uni-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span>Security: Change Password</span>
        </h3>
        <p className="text-xs text-slate-500">
          Regularly updating your password safeguards your student records and assessment submissions.
        </p>

        {pwdMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{pwdMsg}</span>
          </div>
        )}

        {pwdErr && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{pwdErr}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={pwdSubmitting}
            className="px-4 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {pwdSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

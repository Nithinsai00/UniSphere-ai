import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'faculty') navigate('/faculty/dashboard');
    else if (user?.role === 'student') navigate('/student/dashboard');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F7FF] flex items-center justify-center p-6 text-center">
      <div className="uni-card p-8 max-w-md w-full bg-white shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#10213A]">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          You do not have permission to access this portal or resource. UniSphere enforces strict
          role-based data boundary protection.
        </p>
        <button
          onClick={handleReturn}
          className="mt-6 w-full py-2.5 rounded-lg bg-[#245BB5] hover:bg-[#102B57] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Permitted Dashboard</span>
        </button>
      </div>
    </div>
  );
};

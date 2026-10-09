import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Plus, Mail, Phone, BookOpen, Layers } from 'lucide-react';

export const AdminFaculty: React.FC = () => {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    faculty_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    assigned_subjects: 'Data Structures, Algorithms',
    assigned_classes: 'CSE-3A, CSE-3B',
    initial_password: 'Faculty@2026',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await api.getFacultyList();
      setFacultyList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createFaculty({
        ...formData,
        faculty_id: formData.faculty_id.trim().toUpperCase(),
      });
      setIsModalOpen(false);
      loadFaculty();
    } catch (err: any) {
      setError(err.message || 'Failed to register faculty member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">Faculty & Mentors</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic coordinators, departmental designations, and mentoring responsibilities
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              faculty_id: '',
              full_name: '',
              email: '',
              phone_number: '',
              department: 'Computer Science & Engineering',
              designation: 'Assistant Professor',
              assigned_subjects: 'Data Structures, Algorithms',
              assigned_classes: 'CSE-3A, CSE-3B',
              initial_password: 'Faculty@2026',
            });
            setError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-10 text-xs text-slate-400">
            Loading faculty registry...
          </div>
        ) : (
          facultyList.map((f) => (
            <div key={f.id} className="uni-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#245BB5] font-bold flex items-center justify-center text-sm">
                    {f.full_name ? f.full_name.charAt(0) : 'F'}
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {f.faculty_id}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#10213A] mt-3">{f.full_name}</h3>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block mt-0.5">
                  {f.designation}
                </span>
                <p className="text-xs text-slate-500 mt-2 font-medium">{f.department}</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{f.email}</span>
                </div>
                {f.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{f.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Subjects: {f.assigned_subjects || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Classes: {f.assigned_classes || 'All'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Faculty Member"
        subtitle="Creates faculty profile and provisions authentication account."
      >
        <form onSubmit={handleCreateFaculty} className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Faculty ID *
              </label>
              <input
                type="text"
                required
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                placeholder="e.g. FAC006"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Dr. Full Name"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@unisphere.edu"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Associate Professor"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
              <option value="Data Science & Artificial Intelligence">Data Science & Artificial Intelligence</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Assigned Subjects
            </label>
            <input
              type="text"
              value={formData.assigned_subjects}
              onChange={(e) => setFormData({ ...formData, assigned_subjects: e.target.value })}
              placeholder="e.g. Operating Systems, Computer Networks"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Assigned Classes / Groups
            </label>
            <input
              type="text"
              value={formData.assigned_classes}
              onChange={(e) => setFormData({ ...formData, assigned_classes: e.target.value })}
              placeholder="e.g. CSE-3A, CSE-3B"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {submitting ? 'Registering...' : 'Register Faculty Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

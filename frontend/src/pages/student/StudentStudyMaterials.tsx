import React, { useState, useEffect } from 'react';
import { api, getToken } from '../../services/api';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Calendar,
  User,
} from 'lucide-react';

interface StudyMaterial {
  id: number;
  faculty_name: string;
  title: string;
  description: string;
  subject: string;
  topic_unit?: string;
  target_class: string;
  filename: string;
  file_type: string;
  file_size: string;
  created_at: string;
  download_count: number;
  is_recent: boolean;
}

export const StudentStudyMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await api.getStudentStudyMaterials();
      setMaterials(res || []);
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/student/study-materials/${material.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Increment count locally
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === material.id ? { ...m, download_count: (m.download_count || 0) + 1 } : m
        )
      );
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to download the requested file. Please try again.');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjectsList = Array.from(new Set(materials.map((m) => m.subject)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-[#1E3E2D]">Course Study Materials</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#0B4A2B] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Faculty Repository
          </span>
        </div>
        <p className="text-xs text-[#52796F] mt-1">
          Official lecture presentations, reference notes, and curated problem sets released by your course faculty
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DDE7DF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, chapters, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
          />
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20"
          >
            <option value="all">All Subjects ({materials.length})</option>
            {subjectsList.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Material Grid / Cards */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#DDE7DF] shadow-sm text-center text-xs text-slate-400">
          <div className="w-8 h-8 border-4 border-[#0B4A2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading course repository...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#DDE7DF] shadow-sm text-center text-xs text-slate-400">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No study materials match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#DDE7DF] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#0B4A2B] font-mono font-bold text-[10px] uppercase">
                      {m.file_type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{m.file_size}</span>
                  </div>
                  {m.is_recent && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      RECENT
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1E3E2D] line-clamp-2 leading-snug">
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#52796F] font-medium mt-1">
                    <span>{m.subject}</span>
                    {m.topic_unit && (
                      <>
                        <span>•</span>
                        <span>{m.topic_unit}</span>
                      </>
                    )}
                  </div>
                </div>

                {m.description && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{m.faculty_name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{m.created_at}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(m)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B4A2B] hover:bg-[#07361F] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Resource ({m.file_type})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

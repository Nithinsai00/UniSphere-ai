import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Plus,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface StudyMaterialItem {
  id: number;
  title: string;
  description: string;
  subject: string;
  topic_unit?: string;
  target_class: string;
  filename: string;
  file_type: string;
  file_size: string;
  is_published: boolean;
  download_count: number;
  created_at: string;
}

export const FacultyStudyMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [topicUnit, setTopicUnit] = useState('Unit 3');
  const [targetClass, setTargetClass] = useState('CSE - 3rd Year');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFacultyStudyMaterials();
      setMaterials(res || []);
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const maxBytes = 25 * 1024 * 1024; // 25 MB
      if (selected.size > maxBytes) {
        setNotification({
          type: 'error',
          text: 'File size exceeds 25 MB limit. Please select a smaller file.',
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setNotification({ type: 'error', text: 'Please select a file to upload.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject.trim());
      formData.append('topic_unit', topicUnit.trim());
      formData.append('target_class', targetClass.trim());
      formData.append('file', file);

      await api.uploadStudyMaterial(formData);

      setIsUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      setNotification({
        type: 'success',
        text: 'Study material uploaded and published successfully!',
      });
      setTimeout(() => setNotification(null), 4000);
      loadMaterials();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'Failed to upload study material.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await api.togglePublishStudyMaterial(id);
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_published: !m.is_published } : m))
      );
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await api.deleteStudyMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setNotification({ type: 'success', text: 'Study material deleted.' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete study material:', err);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.filename.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjectsList = Array.from(new Set(materials.map((m) => m.subject)));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E3E2D]">Faculty Study Materials</h1>
          <p className="text-xs text-[#52796F] mt-1">
            Upload and distribute academic lecture notes, problem sets, and revision packages (Max 25MB)
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0B4A2B] text-white text-xs font-semibold hover:bg-[#07361F] transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Upload New Material
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#DDE7DF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, subject, or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20"
          >
            <option value="all">All Subjects</option>
            {subjectsList.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-2xl border border-[#DDE7DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E3E2D] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0B4A2B]" />
            Uploaded Learning Resources
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Total: <strong className="text-[#1E3E2D]">{filteredMaterials.length}</strong> resources
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-4 border-[#0B4A2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading uploaded materials...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No study materials found. Click "Upload New Material" to publish course notes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF5EE]/60 text-[#1E3E2D] font-bold border-b border-[#DDE7DF]">
                <tr>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-3">Subject / Unit</th>
                  <th className="py-3 px-3">Target Class</th>
                  <th className="py-3 px-3">Format / Size</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Downloads</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1E3E2D]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B4A2B] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1E3E2D]">{m.title}</div>
                          {m.description && (
                            <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                              {m.description}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {m.filename} • {m.created_at}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{m.subject}</div>
                      {m.topic_unit && (
                        <div className="text-[11px] text-slate-400">{m.topic_unit}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600">{m.target_class}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold uppercase">
                        {m.file_type}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5">{m.file_size}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(m.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          m.is_published
                            ? 'bg-emerald-100 text-[#0B4A2B] hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {m.is_published ? (
                          <>
                            <Eye className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                      {m.download_count}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        title="Delete Material"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#EDF5EE] border-b border-[#DDE7DF] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1E3E2D]">Upload Course Study Material</h3>
                <p className="text-[11px] text-[#52796F]">
                  Supports PDF, PPTX, DOCX, ZIP files up to 25 MB
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-3.5 text-xs">
              {/* File Dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  File Attachment (Max 25 MB)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CFE1D4] hover:border-[#0B4A2B] bg-[#EDF5EE]/40 hover:bg-[#EDF5EE]/70 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold">
                      <FileText className="w-5 h-5 text-[#0B4A2B]" />
                      <span>{file.name}</span>
                      <span className="text-[11px] text-slate-500">
                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-7 h-7 text-[#0B4A2B] mx-auto" />
                      <p className="text-slate-700 font-medium">Click to browse or drag file here</p>
                      <p className="text-[11px] text-slate-400">PDF, PPT, DOCX up to 25MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Process Synchronization Complete Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course / Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 3"
                    value={topicUnit}
                    onChange={(e) => setTopicUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <input
                  type="text"
                  required
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Study Guidelines (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Key concepts, practice questions to review, or exam preparation tips..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="px-4 py-2 rounded-xl bg-[#0B4A2B] text-white font-semibold hover:bg-[#07361F] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  {isUploading ? 'Uploading...' : 'Upload & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

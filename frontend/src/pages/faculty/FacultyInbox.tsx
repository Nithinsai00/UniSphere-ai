import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Mail,
  Search,
  ArrowLeft,
  Reply,
  Send,
  Loader2,
  CheckCircle2,
  User,
  MessageSquare,
  Clock,
  Filter,
} from 'lucide-react';

export const FacultyInbox: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  // Search and filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyMessages();
      setMessages(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    setIsReplying(false);
    setReplyText('');
    setSuccessNotice(null);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSending(true);
    try {
      const res = await api.replyFacultyMessage(selectedMessage.id, replyText.trim());
      // Update selected message replies locally
      const updated = {
        ...selectedMessage,
        replies: res.replies || [...(selectedMessage.replies || []), {
          id: Math.random().toString(),
          sender_name: 'You (Faculty)',
          sender_role: 'Faculty Mentor',
          content: replyText.trim(),
          created_at: new Date().toISOString()
        }]
      };
      setSelectedMessage(updated);
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? updated : m))
      );
      setReplyText('');
      setIsReplying(false);
      setSuccessNotice('Reply dispatched to student successfully.');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setIsSending(false);
    }
  };

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      !search ||
      m.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.student_code?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || m.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
          Faculty Inbox
        </h1>
        <p className="text-xs sm:text-sm text-[#446552] font-semibold mt-0.5">
          Student inquiries, mentoring replies, and academic follow-up communications
        </p>
      </div>

      {selectedMessage ? (
        /* Conversation Detail View */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0B4A2B] hover:text-[#062F1B] px-3.5 py-1.5 rounded-xl bg-white border border-[#D5E2D7] shadow-xs hover:bg-[#F2F7F3] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all messages
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#05603A]">
                {selectedMessage.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedMessage.time}
              </span>
            </div>
          </div>

          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="uni-card p-6 sm:p-7 space-y-6">
            {/* Student Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E2ECE2] gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B4A2B] flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#0A2818]">
                      {selectedMessage.student_name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      {selectedMessage.student_code}
                    </span>
                  </div>
                  <p className="text-xs text-[#52665A] mt-0.5">
                    Sender / Initiator: <span className="font-semibold text-slate-700">{selectedMessage.sender_name}</span> ({selectedMessage.sender_designation || 'Faculty Mentor'})
                  </p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#082F1B] tracking-tight">
                {selectedMessage.subject}
              </h2>
            </div>

            {/* Message Body */}
            <div className="p-5 rounded-2xl bg-[#F8FAF8] border border-[#E4EFE3] text-sm text-[#1A3827] leading-relaxed whitespace-pre-line font-normal">
              {selectedMessage.content}
            </div>

            {/* Conversation Thread / Replies */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#082F1B] uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Conversation History ({selectedMessage.replies.length})</span>
                </div>

                <div className="space-y-3">
                  {selectedMessage.replies.map((reply: any, index: number) => (
                    <div
                      key={reply.id || index}
                      className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1.5 ml-3 sm:ml-6"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0A2818]">
                            {reply.sender_name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#05603A]">
                            {reply.sender_role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {reply.created_at ? new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sent'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#1B3828] leading-relaxed whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Action */}
            <div className="pt-2 border-t border-[#E2ECE2]">
              {!isReplying ? (
                <button
                  type="button"
                  onClick={() => setIsReplying(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply to Thread</span>
                </button>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-[#F8FAF8] border border-emerald-200">
                  <h4 className="text-xs font-bold text-[#082F1B]">
                    Write Reply to {selectedMessage.student_name}
                  </h4>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response or follow-up instructions..."
                    className="w-full p-3.5 bg-white border border-[#D5E2D7] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 resize-y"
                  />
                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSending || !replyText.trim()}
                      onClick={handleSendReply}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Message List View with Search & Filters */
        <div className="space-y-4">
          <div className="uni-card p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, ID, or subject..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-[#DCE5F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs py-2 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-medium w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                <option value="Academic Support">Academic Support</option>
                <option value="Mentoring">Mentoring</option>
                <option value="Placement">Placement</option>
                <option value="Attendance Warning">Attendance Warning</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <span>Loading faculty communications...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="uni-card p-10 text-center text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No messages found</p>
              <p className="text-xs">
                Messages sent to students or replies will appear here.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className="uni-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B4A2B] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#0A2818]">{msg.student_name}</span>
                      <span className="text-[11px] font-mono text-slate-400">• {msg.student_code}</span>
                      {msg.replies && msg.replies.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#05603A]">
                          {msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-[#0A2818] mt-1">{msg.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{msg.preview}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{msg.time}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#05603A]">
                    {msg.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

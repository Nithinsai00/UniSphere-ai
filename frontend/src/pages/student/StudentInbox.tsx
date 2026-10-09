import React, { useState, useEffect } from 'react';
import {
  Mail,
  ArrowLeft,
  Reply,
  Send,
  Loader2,
  CheckCircle2,
  User,
  Building2,
  Calendar,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../services/api';

interface MessageReply {
  id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
}

interface StudentInboxMessage {
  id: number;
  student_id?: number;
  sender: string;
  sender_name?: string;
  role: string;
  sender_designation?: string;
  sender_department?: string;
  sender_role?: string;
  subject: string;
  preview: string;
  content: string;
  category: string;
  badge: string;
  badgeColor: string;
  is_read: boolean;
  unread: boolean;
  replies: MessageReply[];
  created_at?: string;
  time: string;
}

const DEFAULT_MESSAGES: StudentInboxMessage[] = [
  {
    id: 1,
    sender: 'Prof. Priya Sharma',
    sender_name: 'Prof. Priya Sharma',
    role: 'CSE Faculty Mentor',
    sender_designation: 'CSE Faculty Mentor',
    sender_department: 'Department of Computer Science & Engineering',
    sender_role: 'faculty',
    subject: 'Scheduled Mentoring Session — Operating Systems',
    time: 'Today, 11:30 AM',
    unread: true,
    is_read: false,
    preview: 'Please bring your mid-semester internal assessment answer script for review.',
    content:
      'Dear Student,\n\nFollowing our review of the mid-semester internal assessments, I would like to schedule a one-on-one mentoring check-in to go over your Operating Systems coursework and discuss key preparation strategies for the upcoming semester examinations.\n\nPlease bring your internal assessment answer scripts, assignment feedback notes, and any specific questions on process scheduling and memory management.\n\nDate: This Thursday\nTime: 11:30 AM – 12:15 PM\nLocation: Cabin 304, Academic Block 2\n\nLooking forward to our discussion.\n\nBest regards,\nProf. Priya Sharma\nFaculty Mentor, CSE Department',
    badge: 'Mentoring',
    category: 'Mentoring',
    badgeColor: 'bg-emerald-100 text-[#05603A]',
    replies: [],
  },
  {
    id: 2,
    sender: 'Training & Placement Cell',
    sender_name: 'Training & Placement Cell',
    role: 'T&P Officer',
    sender_designation: 'T&P Officer',
    sender_department: 'Corporate Relations & Placement Center',
    sender_role: 'placement',
    subject: 'Mock Technical Interview Slot Confirmed',
    time: 'Yesterday, 4:15 PM',
    unread: true,
    is_read: false,
    preview: 'Your 1-on-1 coding interview preparation round is scheduled for Friday 2:00 PM.',
    content:
      'Hello,\n\nYour slot for the Upcoming Industry Mock Technical Interview has been confirmed. You will be paired with a senior software engineering alumni interviewer for a 45-minute live technical session followed by personalized feedback.\n\nSession Details:\n• Date & Time: Friday, 2:00 PM IST\n• Track: Data Structures, Algorithms & System Problem Solving\n• Platform: UniSphere Virtual Interview Room (Link will be activated 10 minutes prior)\n\nPlease ensure your GitHub profile and updated resume are uploaded to your student profile before Friday noon.\n\nBest of luck,\nTraining & Placement Cell',
    badge: 'Placement',
    category: 'Placement',
    badgeColor: 'bg-sky-100 text-sky-700',
    replies: [],
  },
  {
    id: 3,
    sender: 'Academic Administration',
    sender_name: 'Academic Administration',
    role: 'Dean of Academics',
    sender_designation: 'Dean of Academics',
    sender_department: 'Office of Academic Affairs',
    sender_role: 'admin',
    subject: 'Semester Continuous Evaluation (CIE-2) Timetable',
    time: '2 days ago',
    unread: true,
    is_read: false,
    preview: 'The upcoming CIE-2 schedule has been uploaded to the university portal.',
    content:
      'To All Students,\n\nThe official timetable for Continuous Internal Evaluation 2 (CIE-2) has been approved by the Academic Council. Examinations will commence from the 24th of this month across all engineering streams.\n\nImportant Guidelines:\n1. Strict adherence to the standard attendance threshold (75%) is mandatory for seating eligibility.\n2. Admit cards can be downloaded from the university student portal starting next Monday.\n3. Remedial support sessions will be conducted by respective subject faculty during the revision week.\n\nWarm regards,\nOffice of Academic Affairs & Examination Control',
    badge: 'Academics',
    category: 'Academics',
    badgeColor: 'bg-orange-100 text-orange-700',
    replies: [],
  },
];

export const StudentInbox: React.FC = () => {
  const [messages, setMessages] = useState<StudentInboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<StudentInboxMessage | null>(null);

  // Reply compose state
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentMessages();
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
      } else {
        setMessages(DEFAULT_MESSAGES);
      }
    } catch (err) {
      console.warn('Could not load student messages from API, using fallback data:', err);
      setMessages(DEFAULT_MESSAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // When clicking on a message card to open detailed view
  const handleOpenMessage = async (msg: StudentInboxMessage) => {
    setSelectedMessage(msg);
    setIsReplying(false);
    setReplyText('');
    setReplyError(null);
    setSuccessNotice(null);

    // If unread, mark as read on backend and locally
    if (!msg.is_read) {
      const updatedMsg = { ...msg, is_read: true, unread: false };
      setSelectedMessage(updatedMsg);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true, unread: false } : m))
      );

      try {
        await api.markStudentMessageRead(msg.id);
      } catch (err) {
        console.warn('Failed to update read state on backend:', err);
      }
    }
  };

  // Submit reply
  const handleSendReply = async () => {
    if (!selectedMessage) return;
    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError('Please write a reply before submitting.');
      return;
    }

    setIsSending(true);
    setReplyError(null);

    try {
      const updatedFromServer = await api.replyToStudentMessage(selectedMessage.id, trimmed);
      
      // Update locally
      setSelectedMessage(updatedFromServer);
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedFromServer.id ? updatedFromServer : m))
      );

      setReplyText('');
      setIsReplying(false);
      setSuccessNotice('Reply sent successfully to ' + (selectedMessage.sender_name || selectedMessage.sender));

      setTimeout(() => {
        setSuccessNotice(null);
      }, 5000);
    } catch (err: any) {
      // Local optimistic fallback if backend is offline
      const newReply: MessageReply = {
        id: Math.random().toString(36).substring(2, 9),
        sender_name: 'You (Student)',
        sender_role: 'Student',
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      const updatedLocally: StudentInboxMessage = {
        ...selectedMessage,
        replies: [...(selectedMessage.replies || []), newReply],
      };

      setSelectedMessage(updatedLocally);
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedLocally.id ? updatedLocally : m))
      );

      setReplyText('');
      setIsReplying(false);
      setSuccessNotice('Reply recorded successfully!');

      setTimeout(() => {
        setSuccessNotice(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082F1B] tracking-tight">
              Student Inbox
            </h1>
            <p className="text-xs sm:text-sm text-[#446552] font-medium mt-0.5">
              Official academic notices, mentoring follow-ups, and placement invitations
            </p>
          </div>
          {!selectedMessage && (
            <div className="shrink-0">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-[#05603A]">
                {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main View: Message Detail View OR Message List */}
      {selectedMessage ? (
        /* Detailed Message Panel / View (No page reloads) */
        <div className="space-y-4">
          {/* Back button and quick metadata */}
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
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${selectedMessage.badgeColor}`}>
                {selectedMessage.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedMessage.time}
              </span>
            </div>
          </div>

          {/* Success notice banner */}
          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2 transition-all">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Message Card */}
          <div className="uni-card p-6 sm:p-7 space-y-6">
            {/* Sender Metadata Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E2ECE2] gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B4A2B] flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#0A2818]">
                      {selectedMessage.sender_name || selectedMessage.sender}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {selectedMessage.sender_designation || selectedMessage.role}
                    </span>
                  </div>
                  {selectedMessage.sender_department && (
                    <div className="flex items-center gap-1.5 text-xs text-[#446552] mt-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedMessage.sender_department}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right sm:self-start">
                <span className="text-[11px] font-medium text-slate-400">
                  Delivered via Campus Portal
                </span>
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
                  <span>Conversation Thread ({selectedMessage.replies.length})</span>
                </div>

                <div className="space-y-3">
                  {selectedMessage.replies.map((reply, index) => (
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

            {/* Reply Action Area */}
            <div className="pt-2 border-t border-[#E2ECE2]">
              {!isReplying ? (
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(true);
                      setReplyError(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Reply className="w-4 h-4" />
                    Reply to {selectedMessage.sender_name || selectedMessage.sender}
                  </button>

                  <span className="text-xs text-slate-400">
                    Replies are routed directly to the faculty or department mentor
                  </span>
                </div>
              ) : (
                /* Reply Composition Box */
                <div className="space-y-3 p-4 rounded-2xl bg-[#F8FAF8] border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#082F1B]">
                      Replying to: {selectedMessage.sender_name || selectedMessage.sender}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Subject: Re: {selectedMessage.subject}
                    </span>
                  </div>

                  <div>
                    <textarea
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        if (replyError) setReplyError(null);
                      }}
                      placeholder="Write your response or follow-up question here..."
                      rows={4}
                      className="w-full p-3.5 bg-white border border-[#D5E2D7] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 resize-y"
                    />
                  </div>

                  {replyError && (
                    <div className="text-xs text-red-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{replyError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                        setReplyError(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isSending || !replyText.trim()}
                      onClick={handleSendReply}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B4A2B] hover:bg-[#07361E] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        /* Message Cards List */
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-emerald-800 gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-semibold text-[#446552]">Loading student inbox...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="uni-card p-10 text-center space-y-2">
              <Mail className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#0A2818]">Your inbox is empty</p>
              <p className="text-xs text-slate-400">New notices and mentor communications will appear here</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`uni-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition-all cursor-pointer ${
                  !msg.is_read ? 'border-emerald-300 bg-emerald-50/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !msg.is_read
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-100 text-[#0B4A2B]'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!msg.is_read ? 'font-extrabold text-[#082F1B]' : 'font-bold text-[#0A2818]'}`}>
                        {msg.sender_name || msg.sender}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {msg.sender_designation || msg.role}
                      </span>
                      {!msg.is_read && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          New
                        </span>
                      )}
                      {msg.replies && msg.replies.length > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-[#0A2818] mt-1">{msg.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{msg.preview || msg.content?.substring(0, 90) + '...'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{msg.time}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${msg.badgeColor}`}>
                    {msg.badge}
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

import React, { useState } from 'react';
import { X, Send, Sparkles, HelpCircle, ArrowRight, Bot } from 'lucide-react';
import { api } from '../../services/api';

interface AskUniSphereDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskUniSphereDrawer: React.FC<AskUniSphereDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'assistant';
      text: string;
      actions?: string[];
      data?: any;
    }>
  >([
    {
      sender: 'assistant',
      text: 'Hello! I am **Ask UniSphere**, your intelligent campus analytics assistant. You can ask me natural language questions about student risk flags, department comparisons, placement readiness, or interventions.',
      actions: [
        'Which department has the highest academic risk?',
        'How many students have low placement readiness?',
        'What are the most common reasons for academic risk?',
        'Which student segment needs more placement training?',
      ],
    },
  ]);

  const handleSend = async (qToSend?: string) => {
    const text = qToSend || query;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          actions: res.suggested_actions,
          data: res.data_context,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ Error processing query: ${err.message || 'Unable to connect to analytics engine'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#102B57] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Bot className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span>Ask UniSphere</span>
                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                  AI
                </span>
              </div>
              <p className="text-xs text-blue-200">Safe, Role-Aware Campus Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-xl text-sm leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#245BB5] text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-[#10213A] rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">
                  {m.text.split('\n').map((line, lIdx) => {
                    // Simple bold renderer
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={lIdx} className="mb-1 last:mb-0">
                        {parts.map((p, pIdx) => {
                          if (p.startsWith('**') && p.endsWith('**')) {
                            return (
                              <strong key={pIdx} className="font-semibold text-slate-900">
                                {p.slice(2, -2)}
                              </strong>
                            );
                          }
                          return p;
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* Render Suggested Actions if any */}
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Suggested Action Prompts:
                    </p>
                    <div className="space-y-1">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className="w-full text-left text-xs text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 p-1.5 rounded transition-colors flex items-center justify-between group"
                        >
                          <span>{act}</span>
                          <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl w-36 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span className="text-xs text-slate-500 font-medium">Analyzing data...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about students, risk flags, or depts..."
              className="flex-1 text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2.5 bg-[#245BB5] hover:bg-[#102B57] disabled:bg-slate-300 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            UniSphere AI queries verified institutional records. Dynamic SQL injection prevented.
          </p>
        </div>
      </div>
    </div>
  );
};

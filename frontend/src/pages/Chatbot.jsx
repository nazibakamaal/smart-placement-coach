import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { Bot, Send, Sparkles, AlertCircle } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      text: 'Hi! I am your Smart Placement Coach AI assistant. Ask me anything about aptitude preparation, interview tips, or placement strategies.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError('');
    setInput('');

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await api.post('/chat', { message: trimmed });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: response.data.reply,
          },
        ]);
      } else {
        setError(response.data.message || 'Failed to get AI response.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Unable to reach the AI assistant. Please try again.'
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Sparkles className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Placement Coach</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Get instant guidance for your placement preparation.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[75%] ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-brand-400" />
                    </div>
                  )}

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md shadow-md shadow-brand-600/15'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-brand-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
                      </span>
                      <span>AI is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mx-4 sm:mx-6 mb-3 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs flex items-center space-x-1.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-900/30">
            <div className="flex items-end space-x-2 sm:space-x-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask about aptitude, interviews, or placement tips..."
                className="glass-input flex-1 resize-none min-h-[44px] max-h-32 text-sm py-2.5 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 p-2.5 sm:px-4 sm:py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-md shadow-brand-600/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Send message"
              >
                <Send className="h-5 w-5" />
                <span className="hidden sm:inline ml-1.5">Send</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 hidden sm:block">
              Press Enter to send. Shift + Enter for a new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

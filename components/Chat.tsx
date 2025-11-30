import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface ChatProps {
  lang: Language;
}

export const Chat: React.FC<ChatProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].chat;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset/Initialize welcome message when language changes or on mount
  useEffect(() => {
    // Only set if empty to allow history retention if desired, 
    // but here we reset to show the correct language welcome message easily.
    // Or we can just append if we wanted. For now, simple reset is cleaner for demo.
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: t.welcome,
        timestamp: new Date()
      }
    ]);
  }, [lang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 h-[calc(100vh-100px)]">
      <div className="bg-brand-dark/50 backdrop-blur-md border border-white/10 rounded-2xl h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-brand-900/20 flex items-center gap-3">
          <div className="p-2 rounded-full bg-brand-500/20 text-brand-500">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white">{t.title}</h3>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> {t.status}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white/10 text-gray-100 rounded-bl-none'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === 'model' && <Bot className="w-4 h-4 mt-1 opacity-70 shrink-0" />}
                  <div className="prose prose-invert prose-sm">
                   {msg.text.split('\n').map((line, i) => (
                      <p key={i} className="mb-1 last:mb-0">{line}</p>
                    ))}
                  </div>
                  {msg.role === 'user' && <User className="w-4 h-4 mt-1 opacity-70 shrink-0" />}
                </div>
                <div className="text-[10px] opacity-50 text-right mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{t.thinking}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-brand-900/10">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-4 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-brand-500 focus:outline-none placeholder-gray-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 disabled:bg-transparent transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-2">{t.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
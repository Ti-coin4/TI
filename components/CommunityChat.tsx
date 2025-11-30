
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, ShieldAlert, Trash2, Terminal } from 'lucide-react';
import { PublicMessage, WalletState, Language } from '../types';

interface CommunityChatProps {
  messages: PublicMessage[];
  onSendMessage: (text: string) => void;
  onDeleteMessage?: (id: string) => void;
  wallet: WalletState;
  isAdmin: boolean;
  lang: Language;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ 
  messages, 
  onSendMessage, 
  onDeleteMessage,
  wallet, 
  isAdmin,
  lang 
}) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 h-[calc(100vh-100px)]">
      <div className="bg-black/90 border border-neon-green/30 h-full flex flex-col shadow-[0_0_20px_rgba(0,255,65,0.1)] font-mono relative overflow-hidden">
        
        {/* Matrix Rain effect overlay (simple css) */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(0,255,65,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        <div className="p-3 border-b border-neon-green/30 bg-black flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
             <Terminal className="w-5 h-5 text-neon-green animate-pulse" />
             <h3 className="font-bold text-neon-green uppercase tracking-widest">{lang === 'zh' ? '黑客据点' : 'HIDEOUT_CHANNEL'}</h3>
             <span className="text-[10px] bg-neon-green/10 text-neon-green px-1 border border-neon-green/20">ENCRYPTED</span>
          </div>
          {isAdmin && (
            <span className="text-red-500 text-xs px-2 py-1 border border-red-500 font-bold animate-pulse">ADMIN OVERRIDE</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-neon-green/50 mt-20 text-sm">
              {lang === 'zh' ? '> 等待信号输入...' : '> WAITING FOR INPUT...'}
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="group flex flex-col items-start hover:bg-neon-green/5 p-2 transition-colors relative border-l-2 border-transparent hover:border-neon-green">
              <div className="flex items-center gap-2 mb-1 w-full text-xs">
                <span className={`font-bold ${msg.isAdmin ? 'text-red-500' : 'text-neon-blue'}`}>
                  [{msg.isAdmin ? 'ROOT' : msg.user}]
                </span>
                <span className="text-gray-600">@{formatTime(msg.timestamp)}</span>
                
                {isAdmin && onDeleteMessage && (
                  <button 
                    onClick={() => onDeleteMessage(msg.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className={`pl-1 break-all ${msg.isAdmin ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                {msg.isAdmin ? '>>> ' : ''}{msg.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-3 bg-black border-t border-neon-green/30 z-10">
          <form onSubmit={handleSubmit} className="relative flex gap-2">
            <span className="py-3 text-neon-green font-bold">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'zh' ? (wallet.connected ? "输入代码..." : "需要连接以访问") : (wallet.connected ? "Enter command..." : "Access Denied. Connect Wallet.")}
              disabled={!wallet.connected && !isAdmin}
              className="flex-1 bg-transparent text-neon-green focus:outline-none placeholder-neon-green/30 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={(!wallet.connected && !isAdmin) || !input.trim()}
              className="px-4 py-2 bg-neon-green text-black font-bold hover:bg-white transition-colors disabled:opacity-0"
            >
              SEND
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

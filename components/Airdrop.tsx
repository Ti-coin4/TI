import React, { useState, useEffect, useRef } from 'react';
import { Wallet, CheckCircle, AlertCircle, RefreshCw, Twitter, Send, Activity, Globe } from 'lucide-react';
import { AirdropStatus, Language, WalletState } from '../types';
import { TRANSLATIONS } from '../constants';
import { fetchTokenPrice } from '../services/web3Service';

interface AirdropProps {
  lang: Language;
  wallet: WalletState;
  connectWallet: () => void;
  onSubmit: (address: string) => void;
}

export const Airdrop: React.FC<AirdropProps> = ({ lang, wallet, connectWallet, onSubmit }) => {
  const [status, setStatus] = useState<AirdropStatus>(AirdropStatus.IDLE);
  const [bscAddress, setBscAddress] = useState<string>('');
  const t = TRANSLATIONS[lang].airdrop;

  // Real-time Status Logs
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sync status with wallet connection
  useEffect(() => {
    if (wallet.connected && status === AirdropStatus.IDLE) {
      handleCheckEligibility();
    }
  }, [wallet.connected]);

  // Matrix Log Effect - Keep visual effect for theme
  useEffect(() => {
    const messages = [
      "[SYSTEM] Scanning BSC Mainnet Node #442...",
      "[NETWORK] Block height verified.",
      "[AIRDROP] New allocation request detected...",
      "[AIRDROP] Transaction confirmed.",
      "[SYSTEM] Ti Liquidity Pool synced.",
      "[NETWORK] Gas price stable.",
      "[SYSTEM] Verifying cross-chain bridge status...",
      "[AIRDROP] Processing queue..."
    ];

    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 8));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = () => {
     connectWallet();
  };

  const handleCheckEligibility = async () => {
    setStatus(AirdropStatus.CHECKING_BALANCE);
    try {
      // Real Balance Check
      const price = await fetchTokenPrice();
      const currentPrice = price > 0 ? price : 0.0001; 
      
      const estimatedValue = wallet.balanceTi * currentPrice;

      // Allow if value > $1 OR if user has at least some tokens (fallback)
      if (estimatedValue > 1.0 || wallet.balanceTi > 1000) {
        setStatus(AirdropStatus.TASK_PENDING);
        if (wallet.address) setBscAddress(wallet.address);
      } else {
        setStatus(AirdropStatus.FAILED);
      }
    } catch (e) {
      setStatus(AirdropStatus.FAILED);
    }
  };

  const handleVerifyTask = async () => {
    setStatus(AirdropStatus.VERIFYING_TASK);
    // In a pure frontend, we trust the user click.
    setTimeout(() => {
        setStatus(AirdropStatus.SUBMITTING);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bscAddress.startsWith('0x') || bscAddress.length !== 42) {
      alert("Please enter a valid BSC address");
      return;
    }
    onSubmit(bscAddress);
    setStatus(AirdropStatus.COMPLETED);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12">
      
      {/* LEFT: Main Interaction */}
      <div className="flex-1">
        <div className="mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-4 uppercase">{t.title}</h2>
          <p className="text-gray-400 border-l-4 border-brand-500 pl-4">{t.subtitle} <br/> <span className="text-brand-400">{t.requirement}</span></p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
          
          {/* Progress Steps */}
          <div className="flex justify-between mb-12 relative z-10">
            {[
              { s: AirdropStatus.IDLE, label: t.steps.connect }, 
              { s: AirdropStatus.TASK_PENDING, label: t.steps.tasks }, 
              { s: AirdropStatus.COMPLETED, label: t.steps.claim }
            ].map((step, idx) => {
              let isActive = false;
              let isDone = false;
              
              if (status === AirdropStatus.COMPLETED) isDone = true;
              else if (status === AirdropStatus.SUBMITTING && idx <= 1) isDone = true;
              else if (status === AirdropStatus.TASK_PENDING && idx === 0) isDone = true;
              else if (status === AirdropStatus.CHECKING_BALANCE && idx === 0) isActive = true;
              
              const colorClass = isDone ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(0,255,65,0.5)]' : (isActive ? 'bg-brand-900 text-brand-500 border-brand-500 animate-pulse' : 'bg-gray-800 text-gray-500');

              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all ${colorClass}`}>
                    {isDone ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                  </div>
                  <span className="mt-2 text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">{step.label}</span>
                </div>
              );
            })}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-700 -z-10 transform scale-x-90"></div>
          </div>

          {/* Interaction Area */}
          <div className="min-h-[300px] flex items-center justify-center">
            
            {/* Step 1: Connect */}
            {(status === AirdropStatus.IDLE || status === AirdropStatus.CONNECTING || status === AirdropStatus.CHECKING_BALANCE || status === AirdropStatus.FAILED) && (
              <div className="text-center w-full max-w-md">
                <Wallet className="w-16 h-16 mx-auto text-brand-500 mb-6 drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]" />
                <h3 className="text-2xl font-bold text-white mb-2 font-display">{t.connect.title}</h3>
                <p className="text-gray-400 mb-8">{t.connect.desc}</p>
                
                {status === AirdropStatus.FAILED ? (
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg mb-6 text-red-400 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {t.connect.error}
                  </div>
                ) : null}

                <button
                  onClick={handleConnectWallet}
                  disabled={(status !== AirdropStatus.IDLE && status !== AirdropStatus.FAILED) || wallet.connected}
                  className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_#00ff41]"
                >
                  {status === AirdropStatus.CONNECTING || status === AirdropStatus.CHECKING_BALANCE ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                      {status === AirdropStatus.CONNECTING ? t.connect.connecting : t.connect.verifying}
                    </>
                  ) : (wallet.connected ? t.connect.verifying : t.connect.button)}
                </button>
              </div>
            )}

            {/* Step 2: Tasks */}
            {(status === AirdropStatus.TASK_PENDING || status === AirdropStatus.VERIFYING_TASK) && (
              <div className="w-full max-w-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.tasks.connected}</h4>
                    <p className="text-sm text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {t.tasks.verified}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/50 transition-all">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Twitter className="w-5 h-5 text-blue-400" /> {t.tasks.twitterTitle}
                    </h4>
                    <p className="text-sm text-gray-400 mb-4">
                      {t.tasks.twitterDesc}
                    </p>
                    <a 
                      href="https://twitter.com/intent/tweet?text=Checking%20out%20Ti%20on%20BSC!%20%23TiToTheMoon" 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-center w-full py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium mb-3"
                    >
                      {t.tasks.tweetButton}
                    </a>
                    <button 
                      onClick={handleVerifyTask}
                      disabled={status === AirdropStatus.VERIFYING_TASK}
                      className="w-full py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-500 disabled:opacity-50"
                    >
                      {status === AirdropStatus.VERIFYING_TASK ? t.tasks.verifyingButton : t.tasks.verifyButton}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Submit */}
            {status === AirdropStatus.SUBMITTING && (
               <form onSubmit={handleSubmit} className="w-full max-w-md text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 animate-pulse">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t.submit.title}</h3>
                  <p className="text-gray-400 mb-6">{t.submit.desc}</p>
                  
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder={t.submit.placeholder}
                      value={bscAddress}
                      onChange={(e) => setBscAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-brand-500 text-white outline-none font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {t.submit.button} <Send className="w-4 h-4" />
                  </button>
               </form>
            )}

            {/* Step 4: Done */}
            {status === AirdropStatus.COMPLETED && (
              <div className="text-center animate-fade-in-up">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-500 to-brand-accent rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-500/50">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{t.success.title}</h3>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                  {t.success.desc}
                </p>
                <button
                  onClick={() => setStatus(AirdropStatus.IDLE)}
                  className="text-brand-400 hover:text-white underline text-sm"
                >
                  {t.success.reset}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT: Status Board */}
      <div className="w-full lg:w-80 space-y-6">
         
         {/* Global Stats */}
         <div className="bg-black border border-brand-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-brand-500/60 transition-colors">
            <div className="absolute inset-0 bg-brand-500/5 animate-pulse-fast"></div>
            <h3 className="text-xs text-brand-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
               <Globe className="w-3 h-3" /> Global Supply
            </h3>
            <p className="text-2xl font-mono font-bold text-white">45,291,000 <span className="text-xs text-gray-500">Ti</span></p>
            <div className="mt-4 w-full bg-gray-800 h-1 rounded overflow-hidden">
               <div className="bg-brand-500 h-full w-[45%]"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">45% Distributed</p>
         </div>

         {/* Matrix Log */}
         <div className="bg-black border border-brand-500/30 rounded-xl overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 bg-brand-900/20 border-b border-brand-500/30 flex justify-between items-center">
               <span className="text-xs font-bold text-brand-400 uppercase flex items-center gap-2">
                 <Activity className="w-3 h-3 animate-pulse" /> Live Feed
               </span>
               <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
            </div>
            <div className="flex-1 p-4 font-mono text-xs space-y-3 overflow-hidden" ref={logContainerRef}>
               {logs.map((log, i) => (
                 <div key={i} className={`opacity-${Math.max(20, 100 - i * 15)} text-brand-300 animate-fade-in`}>
                   {log}
                 </div>
               ))}
               <div className="animate-pulse text-brand-500/50">_</div>
            </div>
         </div>

      </div>
    </div>
  );
};
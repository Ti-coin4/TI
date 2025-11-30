
import React, { useState } from 'react';
import { Menu, X, Globe, Wallet, TrendingUp, FileText, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { TRANSLATIONS } from '../constants';
import { Language, WalletState, SiteConfig } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  wallet: WalletState;
  connectWallet: () => void;
  currentPrice: number;
  config: SiteConfig; // Accepted config
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  lang, 
  setLang, 
  wallet, 
  connectWallet,
  currentPrice,
  config
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = TRANSLATIONS[lang].nav;

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'swap', label: t.swap },
    { id: 'chart', label: t.chart },
    { id: 'whitepaper', label: t.whitepaper },
    { id: 'community', label: t.community },
    { id: 'airdrop', label: t.airdrop },
    { id: 'admin', label: t.admin },
  ];

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Function to handle chart click - open Swap but maybe scroll to chart or just set tab
  const handleNavClick = (id: string) => {
    setActiveTab(id === 'chart' ? 'swap' : id);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-neon-dark/80 backdrop-blur-lg border-b border-neon-blue/30 shadow-[0_0_20px_rgba(0,243,255,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer gap-4 group" onClick={() => setActiveTab('home')}>
            <div className="flex items-center">
              <Logo className="w-10 h-10 mr-3" />
              <span className="text-2xl font-display font-bold text-white tracking-widest group-hover:text-neon-blue transition-colors">Ti</span>
            </div>
            
            {/* Price Ticker */}
            <div className="hidden sm:flex items-center px-3 py-1 rounded bg-black/50 border border-neon-green/50 text-neon-green text-xs font-mono animate-pulse shadow-[0_0_10px_rgba(0,255,65,0.2)]">
              <TrendingUp className="w-3 h-3 mr-1" />
              ${currentPrice.toFixed(4)}
            </div>
          </div>
          
          <div className="hidden xl:flex items-center">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 relative overflow-hidden group ${
                    activeTab === item.id
                      ? 'text-neon-dark bg-neon-blue shadow-[0_0_15px_#00f3ff]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {activeTab !== item.id && (
                     <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-neon-blue group-hover:w-full transition-all duration-300"></div>
                  )}
                </button>
              ))}
              
              {/* Wallet Button */}
              <button
                onClick={connectWallet}
                className={`ml-6 flex items-center px-5 py-2 rounded clip-path-polygon font-bold text-sm transition-all duration-300 border ${
                  wallet.connected 
                    ? 'bg-neon-dark text-neon-green border-neon-green shadow-[0_0_10px_rgba(0,255,65,0.3)]' 
                    : 'bg-neon-purple text-white border-neon-purple hover:bg-neon-purple/80 hover:shadow-[0_0_20px_#bd00ff]'
                }`}
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {wallet.connected ? formatAddress(wallet.address) : t.connect}
              </button>
              
              <button 
                onClick={toggleLang}
                className="ml-3 p-2 text-gray-400 hover:text-neon-blue transition-colors hover:rotate-180 duration-500"
                title="Switch Language"
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="xl:hidden flex items-center gap-4">
            <div className="flex items-center px-2 py-1 rounded bg-black/50 border border-neon-green/50 text-neon-green text-xs font-mono">
              ${currentPrice.toFixed(4)}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded text-neon-blue hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X className="block h-8 w-8" /> : <Menu className="block h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="xl:hidden bg-neon-dark/95 backdrop-blur-xl border-b border-neon-blue/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-3 py-3 rounded text-base font-bold font-display uppercase ${
                  activeTab === item.id
                    ? 'text-neon-blue bg-neon-blue/10 border-l-4 border-neon-blue'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 pb-2 border-t border-white/10 mt-2">
                <button
                    onClick={() => {
                    connectWallet();
                    setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-3 rounded text-base font-bold flex items-center ${
                    wallet.connected ? 'text-neon-green' : 'text-neon-purple'
                    }`}
                >
                    <Wallet className="w-5 h-5 mr-3" />
                    {wallet.connected ? formatAddress(wallet.address) : t.connect}
                </button>
                <button 
                    onClick={() => {
                    toggleLang();
                    setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-3 rounded text-base font-medium text-gray-400 flex items-center"
                >
                    <Globe className="w-5 h-5 mr-3"/> {lang === 'zh' ? 'Switch to English' : '切换中文'}
                </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

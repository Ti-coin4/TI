
import React, { useState } from 'react';
import { Copy, Check, ArrowRight, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import { TOKEN_CONFIG, TRANSLATIONS } from '../constants';
import { Language, SiteConfig } from '../types';

interface HeroProps {
  lang: Language;
  config: SiteConfig;
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, config, setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang].hero;

  const copyAddress = () => {
    navigator.clipboard.writeText(TOKEN_CONFIG.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 overflow-hidden scanlines">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
         {/* Grid Floor */}
         <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(0,243,255,0.1))] transform perspective-[1000px] rotateX(60deg) origin-bottom"></div>
         <div className="absolute bottom-0 left-0 right-0 h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] transform perspective-[500px] rotateX(60deg) origin-bottom"></div>
         
         {/* Floating Orbs */}
         <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-neon-blue/20 rounded-full blur-[60px] animate-float"></div>
         <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-neon-purple/20 rounded-full blur-[80px] animate-float delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        
        {/* System Ready Badge */}
        <div className="inline-flex items-center px-6 py-2 rounded border border-neon-green/30 bg-black/60 text-neon-green font-mono text-sm tracking-widest mb-10 shadow-[0_0_10px_rgba(0,255,65,0.2)] animate-pulse-fast">
          <span className="w-2 h-2 bg-neon-green mr-3 animate-ping"></span>
          {t.badge}
        </div>

        {/* Glitch Title */}
        <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-6 leading-tight uppercase relative">
          <span className="block">{config.heroTitlePrefix}</span>
          <span className="text-neon-blue glitch-text" data-text="Ti">Ti</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
             {config.heroTitleSuffix}
          </span>
        </h1>

        <p className="mt-4 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light border-l-4 border-neon-blue pl-6 bg-black/30 backdrop-blur-sm py-4">
          {config.heroSubtitle}
        </p>

        {/* Contract Address Terminal */}
        <div className="w-full max-w-3xl bg-black/80 backdrop-blur border border-neon-blue/30 rounded p-1 mb-12 shadow-[0_0_30px_rgba(0,243,255,0.1)] group hover:border-neon-blue transition-colors duration-500">
           <div className="flex flex-col sm:flex-row items-center bg-white/5 p-4 rounded gap-4">
              <div className="flex-1 text-center sm:text-left min-w-0 font-mono">
                <p className="text-xs text-neon-blue uppercase tracking-widest mb-1 opacity-70 flex items-center gap-2">
                   <Cpu className="w-3 h-3"/> {t.contractLabel}
                </p>
                <p className="text-sm sm:text-lg text-white truncate select-all tracking-wider">
                  {TOKEN_CONFIG.address}
                </p>
              </div>
              <button
                onClick={copyAddress}
                className="relative overflow-hidden px-6 py-3 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 font-bold uppercase tracking-wider transition-all active:scale-95 shrink-0 w-full sm:w-auto hover:shadow-[0_0_15px_#00f3ff]"
              >
                <span className="relative z-10 flex items-center justify-center">
                   {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                   {copied ? t.copied : t.copy}
                </span>
              </button>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('swap')}
            className="group relative px-8 py-4 bg-neon-purple text-white font-display font-bold text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_#bd00ff]"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center">
               {t.buy} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <a
            href={TOKEN_CONFIG.telegram}
            target="_blank"
            rel="noreferrer"
            className="group relative px-8 py-4 bg-transparent border border-white/20 text-white font-display font-bold text-lg uppercase tracking-widest overflow-hidden transition-all hover:bg-white/5 hover:border-white/50"
            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}
          >
             {t.community}
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-6xl">
           {[
             { icon: ShieldCheck, title: t.features.secure, desc: t.features.secureDesc, color: 'text-neon-green', border: 'border-neon-green' },
             { icon: Zap, title: t.features.fast, desc: t.features.fastDesc, color: 'text-neon-blue', border: 'border-neon-blue' },
             { icon: Globe, title: t.features.global, desc: t.features.globalDesc, color: 'text-neon-purple', border: 'border-neon-purple' }
           ].map((feature, idx) => (
             <div key={idx} className="group relative p-8 bg-black/40 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute top-0 left-0 w-full h-1 ${feature.color.replace('text', 'bg')} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                <feature.icon className={`w-12 h-12 mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                <h3 className="text-xl font-display font-bold text-white mb-3 uppercase">{feature.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

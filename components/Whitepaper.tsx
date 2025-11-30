
import React from 'react';
import { FileText, Award, Layers, Rocket } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface WhitepaperProps {
  lang: Language;
}

export const Whitepaper: React.FC<WhitepaperProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].whitepaper;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in-up">
      <div className="bg-brand-dark/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/20 text-brand-500 mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            {t.title}
          </h1>
          <p className="text-brand-400 font-mono text-sm tracking-widest uppercase">{t.version}</p>
        </div>

        {/* Section 1: Intro */}
        <div className="mb-12 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-3">
            <Award className="w-6 h-6 text-brand-500" />
            {t.intro.title}
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            {t.intro.content}
          </p>
        </div>

        {/* Section 2: Vision */}
        <div className="mb-12 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-3">
            <Layers className="w-6 h-6 text-brand-500" />
            {t.vision.title}
          </h2>
          <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
            {t.vision.content}
          </div>
        </div>

        {/* Section 3: Tokenomics */}
        <div className="mb-12 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 flex items-center justify-center text-xs font-bold text-brand-500">Ti</div>
            {t.tokenomics.title}
          </h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <p className="text-gray-300 mb-6 whitespace-pre-line font-mono text-sm md:text-base">
              {t.tokenomics.content}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.tokenomics.distribution.map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Roadmap */}
        <div className="mb-12 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-brand-500" />
            {t.roadmap.title}
          </h2>
          <div className="space-y-6 border-l-2 border-brand-900 ml-3 pl-8 relative">
             {/* Q1 */}
             <div className="relative">
               <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-brand-500 border-4 border-brand-900"></div>
               <h3 className="text-lg font-bold text-white mb-2">{t.roadmap.q1}</h3>
               <ul className="list-disc list-outside ml-4 text-gray-400 space-y-1">
                 {t.roadmap.q1_items.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
               </ul>
             </div>
             {/* Q2 */}
             <div className="relative">
               <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-gray-700 border-4 border-brand-900"></div>
               <h3 className="text-lg font-bold text-white mb-2 opacity-80">{t.roadmap.q2}</h3>
               <ul className="list-disc list-outside ml-4 text-gray-400 space-y-1 opacity-80">
                 {t.roadmap.q2_items.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
               </ul>
             </div>
             {/* Q3 */}
             <div className="relative">
               <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-gray-700 border-4 border-brand-900"></div>
               <h3 className="text-lg font-bold text-white mb-2 opacity-60">{t.roadmap.q3}</h3>
               <ul className="list-disc list-outside ml-4 text-gray-400 space-y-1 opacity-60">
                 {t.roadmap.q3_items.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
               </ul>
             </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-4 bg-red-900/10 border border-red-500/20 rounded-lg text-center relative z-10">
           <h4 className="text-red-400 font-bold text-sm mb-1">{t.disclaimer.title}</h4>
           <p className="text-red-300/70 text-xs">{t.disclaimer.content}</p>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[80px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px] -z-0"></div>
      </div>
    </div>
  );
};

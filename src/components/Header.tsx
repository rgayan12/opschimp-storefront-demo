import React from 'react';
import { Sprout, Settings, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenSandbox: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSandbox, hasCustomKey }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 leading-tight block">LawnsVille Lawn Care</span>
            <span className="text-xs text-slate-500 block">Powered by OpsChimp Storefront API</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Server-to-Server Edge Proxy</span>
          </div>

          <button
            onClick={onOpenSandbox}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>API Settings</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

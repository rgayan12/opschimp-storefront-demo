import React, { useState, useEffect } from 'react';
import { X, Key, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SandboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SandboxDrawer: React.FC<SandboxDrawerProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setApiKey(sessionStorage.getItem('opschimp_demo_key') || '');
    setBaseUrl(sessionStorage.getItem('opschimp_demo_url') || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      sessionStorage.setItem('opschimp_demo_key', apiKey.trim());
    } else {
      sessionStorage.removeItem('opschimp_demo_key');
    }

    if (baseUrl.trim()) {
      sessionStorage.setItem('opschimp_demo_url', baseUrl.trim());
    } else {
      sessionStorage.removeItem('opschimp_demo_url');
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    sessionStorage.removeItem('opschimp_demo_key');
    sessionStorage.removeItem('opschimp_demo_url');
    setApiKey('');
    setBaseUrl('');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900">Developer Sandbox Settings</h3>
            <p className="text-xs text-slate-500">Override edge function target for live testing</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Server-to-Server Relay:</strong> In production on Netlify, your API key is stored securely in Netlify Environment Variables. In this demo playground, any key you enter here is sent only via a custom header to the edge function.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                OpsChimp API Base URL
              </label>
              <input
                type="text"
                placeholder="https://your-domain.com/api/v1/client"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: Configured via Netlify Environment Variables</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                Tenant Bearer Token
              </label>
              <input
                type="password"
                placeholder="Paste Bearer Token from Developer Settings"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Found in OpsChimp Settings &gt; Developer API &gt; API Credentials</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Sandbox Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

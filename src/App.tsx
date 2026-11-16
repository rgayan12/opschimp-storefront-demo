import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SandboxDrawer } from './components/SandboxDrawer';
import { StepLead } from './components/StepLead';
import { StepMeasurements } from './components/StepMeasurements';
import { StepPackages } from './components/StepPackages';
import { StepCheckout } from './components/StepCheckout';
import { LeadPayload, MeasurementsResponse, PackageItem, AddonBundle } from './types/opschimp';
import { Check, ShieldCheck } from 'lucide-react';

export function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  // Flow State
  const [leadId, setLeadId] = useState<number | null>(null);
  const [leadData, setLeadData] = useState<LeadPayload | null>(null);
  const [measurementsData, setMeasurementsData] = useState<MeasurementsResponse | null>(null);
  const [packageSelection, setPackageSelection] = useState<{
    selectedPackage: PackageItem;
    billingFrequency: 'monthly' | 'annual';
    selectedBundles: AddonBundle[];
    totalPrice: number;
  } | null>(null);

  useEffect(() => {
    setHasCustomKey(Boolean(sessionStorage.getItem('opschimp_demo_key')));
  }, []);

  const stepsConfig = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Lawn Sizing' },
    { num: 3, label: 'Choose Plan' },
    { num: 4, label: 'Card Setup' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        onOpenSandbox={() => setIsSandboxOpen(true)}
        hasCustomKey={hasCustomKey}
      />

      <SandboxDrawer
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onSaved={() => setHasCustomKey(Boolean(sessionStorage.getItem('opschimp_demo_key')))}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Stepper Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-600 transition-all duration-300 -z-0"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {stepsConfig.map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div key={s.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-brand-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-white text-brand-600 border-2 border-brand-600 shadow-md ring-4 ring-brand-100'
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 transition-colors hidden sm:block ${
                      isCurrent ? 'text-slate-900' : isPassed ? 'text-brand-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Views */}
        {step === 1 && (
          <StepLead
            initialData={leadData || undefined}
            onSuccess={(id, data) => {
              setLeadId(id);
              setLeadData(data);
              setStep(2);
            }}
          />
        )}

        {step === 2 && leadId && (
          <StepMeasurements
            leadId={leadId}
            onBack={() => setStep(1)}
            onSuccess={(data) => {
              setMeasurementsData(data);
              setStep(3);
            }}
          />
        )}

        {step === 3 && measurementsData && (
          <StepPackages
            data={measurementsData}
            onBack={() => setStep(2)}
            onSelect={(selection) => {
              setPackageSelection(selection);
              setStep(4);
            }}
          />
        )}

        {step === 4 && leadId && leadData && measurementsData && packageSelection && (
          <StepCheckout
            leadId={leadId}
            leadData={leadData}
            quoteNumber={measurementsData.quote_number}
            selectedPackage={packageSelection.selectedPackage}
            billingFrequency={packageSelection.billingFrequency}
            selectedBundles={packageSelection.selectedBundles}
            totalPrice={packageSelection.totalPrice}
            onBack={() => setStep(3)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Built for Netlify Edge Functions & OpsChimp Client API v1</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Zero client-side secrets • Live rate-card calculations • Instant Chimp Pay Card Setup
          </p>
        </div>
      </footer>
    </div>
  );
}
export default App;

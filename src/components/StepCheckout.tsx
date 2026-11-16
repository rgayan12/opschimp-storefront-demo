import React, { useState } from 'react';
import { ArrowLeft, Loader2, ExternalLink, CheckCircle2, Lock } from 'lucide-react';
import { PackageItem, AddonBundle, LeadPayload } from '../types/opschimp';
import { api } from '../services/api';

interface StepCheckoutProps {
  leadId: number;
  leadData: LeadPayload;
  quoteNumber: string;
  selectedPackage: PackageItem;
  billingFrequency: 'monthly' | 'annual';
  selectedBundles: AddonBundle[];
  totalPrice: number;
  onBack: () => void;
}

export const StepCheckout: React.FC<StepCheckoutProps> = ({
  leadId,
  leadData,
  quoteNumber,
  selectedPackage,
  billingFrequency,
  selectedBundles,
  totalPrice,
  onBack,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardSetupUrl, setCardSetupUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please accept the service terms and recurring billing agreement.');
      return;
    }

    setLoading(true);
    setError(null);

    // Extract all treatment IDs from selected bundles
    const selectedAddonIds: number[] = [];
    selectedBundles.forEach((b) => {
      if (b.treatment_ids) {
        selectedAddonIds.push(...b.treatment_ids);
      } else if (b.treatments) {
        b.treatments.forEach((t) => selectedAddonIds.push(t.id));
      }
    });

    try {
      const response = await api.acceptTerms(leadId, {
        package_id: selectedPackage.package_id,
        plan_name: selectedPackage.package_name,
        price: totalPrice,
        selected_bundles: selectedBundles.map((b) => b.bundle_name),
        selected_addons: Array.from(new Set(selectedAddonIds)),
        billing_frequency: billingFrequency,
        terms_accepted: true,
        terms_version: 'v2026.1',
        terms_timestamp: new Date().toISOString(),
      });

      if (response.card_setup_url) {
        setCardSetupUrl(response.card_setup_url);
      } else {
        throw new Error('No signed Chimp Pay card setup URL returned.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete order. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (cardSetupUrl) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-10 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">Quote {quoteNumber} Converted</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Ready for Secure Card Setup</h2>
          <p className="text-sm text-slate-500 mt-2">
            Your quote and package selections have been recorded in OpsChimp. A signed, tokenized Chimp Pay Card Setup session is ready.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 break-all text-left">
          <span className="font-bold text-slate-700 block mb-1">Signed Card Setup URL:</span>
          {cardSetupUrl}
        </div>

        <div className="pt-2">
          <a
            href={cardSetupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all text-sm"
          >
            <span>Proceed to Chimp Pay Card Registration</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Step 4: Review Order & Authorize Card</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review your chosen lawn care plan. Once confirmed, you will be redirected to Chimp Pay for tokenized card verification.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Order Summary Card */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 space-y-3">
        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
          <span className="font-medium text-slate-600">Customer Details</span>
          <span className="font-semibold text-slate-900 text-right">
            {leadData.first_name} {leadData.last_name} ({leadData.postcode})
          </span>
        </div>

        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
          <div>
            <span className="font-semibold text-slate-900 block">{selectedPackage.package_name} Plan</span>
            <span className="text-xs text-slate-500">{selectedPackage.annual_visit_count} treatments / year</span>
          </div>
          <span className="font-bold text-slate-900">
            £{billingFrequency === 'monthly' ? selectedPackage.monthly_direct_debit_value : selectedPackage.direct_debit_annual}
            <span className="text-xs font-normal text-slate-500">/{billingFrequency === 'monthly' ? 'mo' : 'yr'}</span>
          </span>
        </div>

        {selectedBundles.map((b) => (
          <div key={b.bundle_name} className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
            <div>
              <span className="font-semibold text-slate-900 capitalize block">{b.bundle_name} Add-on</span>
              <span className="text-xs text-emerald-700 font-medium">{b.discount_percent}% bundle savings</span>
            </div>
            <span className="font-bold text-slate-900">
              +£{billingFrequency === 'monthly' ? b.monthly_subscription_addition : b.bundle_annual_price}
              <span className="text-xs font-normal text-slate-500">/{billingFrequency === 'monthly' ? 'mo' : 'yr'}</span>
            </span>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2">
          <span className="font-extrabold text-base text-slate-900">Total Recurring Amount</span>
          <div className="text-right">
            <span className="font-black text-2xl text-brand-700">£{totalPrice}</span>
            <span className="text-xs text-slate-500 font-medium block">
              /{billingFrequency === 'monthly' ? 'month via Direct Debit' : 'annual upfront'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
          />
          <div className="text-xs text-slate-600 leading-relaxed">
            I agree to the <strong>Terms of Service</strong> and authorize LawnsVille Lawn Care to initiate recurring subscription payments for this service plan. Card details are tokenized securely with 256-bit encryption via Chimp Pay.
          </div>
        </label>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Plans</span>
          </button>

          <button
            type="submit"
            disabled={loading || !termsAccepted}
            className="flex items-center gap-2 px-7 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing Chimp Pay Session...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize & Register Card</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Check, Sparkles, Tag, ArrowRight, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { MeasurementsResponse, PackageItem, AddonBundle } from '../types/opschimp';

interface StepPackagesProps {
  data: MeasurementsResponse;
  onSelect: (selection: {
    selectedPackage: PackageItem;
    billingFrequency: 'monthly' | 'annual';
    selectedBundles: AddonBundle[];
    totalPrice: number;
  }) => void;
  onBack: () => void;
}

export const StepPackages: React.FC<StepPackagesProps> = ({ data, onSelect, onBack }) => {
  const packages = data.packages || [];
  const [selectedPkgId, setSelectedPkgId] = useState<number>(packages[0]?.package_id || 0);
  const [billingFreq, setBillingFreq] = useState<'monthly' | 'annual'>('monthly');
  const [selectedBundleNames, setSelectedBundleNames] = useState<string[]>([]);
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);

  const currentPkg = packages.find((p) => p.package_id === selectedPkgId) || packages[0];
  const activeCampaign = currentPkg?.campaigns?.[0];

  // Available bundles for this package or fallback to root
  const availableBundles: AddonBundle[] =
    (currentPkg?.available_addons && currentPkg.available_addons.length > 0)
      ? currentPkg.available_addons
      : (activeCampaign?.bundles && activeCampaign.bundles.length > 0)
      ? activeCampaign.bundles
      : data.available_addons || [];

  const handleToggleBundle = (bundleName: string) => {
    if (selectedBundleNames.includes(bundleName)) {
      setSelectedBundleNames(selectedBundleNames.filter((n) => n !== bundleName));
    } else {
      setSelectedBundleNames([...selectedBundleNames, bundleName]);
    }
  };

  // Calculations
  const baseMonthly = currentPkg?.monthly_direct_debit_value || 0;
  const baseAnnual = currentPkg?.direct_debit_annual || currentPkg?.pay_as_you_go_annual || 0;

  const chosenBundles = availableBundles.filter((b) => selectedBundleNames.includes(b.bundle_name));
  const addonsMonthly = chosenBundles.reduce((sum, b) => sum + (Number(b.monthly_subscription_addition) || 0), 0);
  const addonsAnnual = chosenBundles.reduce((sum, b) => sum + (Number(b.bundle_annual_price) || 0), 0);

  const totalMonthly = Math.round((baseMonthly + addonsMonthly) * 100) / 100;
  const totalAnnual = Math.round((baseAnnual + addonsAnnual) * 100) / 100;
  const finalPrice = billingFreq === 'monthly' ? totalMonthly : totalAnnual;

  const handleContinue = () => {
    if (!currentPkg) return;
    onSelect({
      selectedPackage: currentPkg,
      billingFrequency: billingFreq,
      selectedBundles: chosenBundles,
      totalPrice: finalPrice,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Lawn Area & Rate Bracket */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">Instant Quote Generated</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Reference {data.quote_number} — {data.lawn_size_sqm} m² Lawn Area
          </h2>
          {data.pricing_range && (
            <p className="text-xs text-slate-500 mt-1">
              Rate Bracket: {data.pricing_range.sqm_from} – {data.pricing_range.sqm_to || '+'} m² (Base £{data.pricing_range.base_price}/visit)
            </p>
          )}
        </div>

        {/* Billing Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingFreq('monthly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              billingFreq === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Direct Debit
          </button>
          <button
            type="button"
            onClick={() => setBillingFreq('annual')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              billingFreq === 'annual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pay Annually
          </button>
        </div>
      </div>

      {/* Package Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const isSelected = pkg.package_id === selectedPkgId;
          const camp = pkg.campaigns?.[0];
          const price = billingFreq === 'monthly' ? pkg.monthly_direct_debit_value : pkg.direct_debit_annual;

          return (
            <div
              key={pkg.package_id}
              onClick={() => setSelectedPkgId(pkg.package_id)}
              className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-600 shadow-md ring-4 ring-brand-100'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Campaign Studio Promo Badge */}
              {camp?.badge && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold uppercase tracking-wide rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{camp.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-lg text-slate-900">{pkg.package_name}</h3>
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: pkg.display_color || '#10b981' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? (pkg.display_color || '#10b981') : 'transparent' }}
                    ></div>
                  </div>
                </div>

                {camp?.tagline ? (
                  <p className="text-xs font-medium text-brand-700 mb-3">{camp.tagline}</p>
                ) : (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{pkg.description || 'Full seasonal lawn care treatment schedule.'}</p>
                )}

                {/* Price Display */}
                <div className="py-3 border-y border-slate-100 my-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">£{price}</span>
                    <span className="text-xs text-slate-500 font-medium">/{billingFreq === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {pkg.annual_visit_count} treatments per year
                  </span>
                </div>

                {/* Selling Points Checklist */}
                <ul className="space-y-2 mt-4 text-xs text-slate-600">
                  {(camp?.selling_points && camp.selling_points.length > 0
                    ? camp.selling_points
                    : pkg.treatments?.slice(0, 4).map((t) => t.name)
                  )?.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected Package' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promotional Add-on Bundles Section */}
      {availableBundles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Promotional Add-on Bundles</h3>
              <p className="text-xs text-slate-500">
                Enhance your plan with seasonal treatments. Save 10% when bundled today.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {availableBundles.map((bundle) => {
              const isChecked = selectedBundleNames.includes(bundle.bundle_name);
              const isExpanded = expandedBundle === bundle.bundle_name;

              return (
                <div
                  key={bundle.bundle_name}
                  className={`rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-brand-50/50 border-brand-300 ring-2 ring-brand-100'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBundle(bundle.bundle_name)}
                        className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 capitalize">{bundle.bundle_name}</span>
                          {bundle.discount_percent > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                              {bundle.discount_percent}% OFF
                            </span>
                          )}
                          {bundle.callout && (
                            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {bundle.callout}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-500 mt-0.5 block">
                          Includes {bundle.treatments?.length || bundle.treatment_ids?.length || 0} specialist treatments (Surfactants, Aeration, Weed controls)
                        </span>
                      </div>
                    </label>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-7 sm:pl-0">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-slate-900 block">
                          +£{bundle.monthly_subscription_addition}/mo
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          Save £{bundle.bundle_savings}/yr
                        </span>
                      </div>

                      {bundle.treatments && bundle.treatments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedBundle(isExpanded ? null : bundle.bundle_name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Itemized Treatments */}
                  {isExpanded && bundle.treatments && (
                    <div className="px-5 pb-4 pt-1 border-t border-slate-200/60 bg-white/60 rounded-b-xl space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pt-2">
                        Treatments included in this bundle:
                      </span>
                      {bundle.treatments.map((t) => (
                        <div key={t.id} className="text-xs flex items-start justify-between gap-4 py-1">
                          <div>
                            <span className="font-semibold text-slate-800">{t.name}</span>
                            {t.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">{t.description}</p>
                            )}
                          </div>
                          <span className="text-xs font-mono font-medium text-slate-600 shrink-0">£{t.unit_price} / visit</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Order Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Selected:</span>
            <span className="text-sm font-bold text-white">{currentPkg?.package_name} Plan</span>
            {chosenBundles.length > 0 && (
              <span className="text-xs text-brand-300 font-medium">
                + {chosenBundles.length} Add-on Bundle{chosenBundles.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-400">£{finalPrice}</span>
            <span className="text-xs text-slate-400 font-medium">
              /{billingFreq === 'monthly' ? 'month via Direct Debit' : 'annual upfront'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Adjust Sizing
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirm & Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

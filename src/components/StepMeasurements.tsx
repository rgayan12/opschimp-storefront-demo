import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { AreaZone, MeasurementsResponse } from '../types/opschimp';
import { api } from '../services/api';

interface StepMeasurementsProps {
  leadId: number;
  onSuccess: (data: MeasurementsResponse) => void;
  onBack: () => void;
}

export const StepMeasurements: React.FC<StepMeasurementsProps> = ({ leadId, onSuccess, onBack }) => {
  const [areas, setAreas] = useState<AreaZone[]>([
    { name: 'Front Lawn', size: 40, is_hard_surface: false, active: true },
    { name: 'Back Garden', size: 180, is_hard_surface: false, active: true },
    { name: 'Driveway', size: 25, is_hard_surface: true, active: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalLawn = areas
    .filter((a) => !a.is_hard_surface && a.active)
    .reduce((sum, a) => sum + (Number(a.size) || 0), 0);

  const totalHard = areas
    .filter((a) => a.is_hard_surface && a.active)
    .reduce((sum, a) => sum + (Number(a.size) || 0), 0);

  const handleAddZone = () => {
    setAreas([
      ...areas,
      { name: `Zone ${areas.length + 1}`, size: 50, is_hard_surface: false, active: true },
    ]);
  };

  const handleRemoveZone = (index: number) => {
    if (areas.length <= 1) return;
    setAreas(areas.filter((_, idx) => idx !== index));
  };

  const handleUpdateZone = (index: number, field: keyof AreaZone, value: any) => {
    const updated = [...areas];
    updated[index] = { ...updated[index], [field]: value };
    setAreas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalLawn <= 0) {
      setError('Please enter at least one lawn surface zone greater than 0 m².');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.submitMeasurements(leadId, areas, 'maps_helper');
      onSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate pricing. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Step 2: Lawn Sizing & Surface Breakdown</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your lawn zones. Hard surfaces (driveways/patios) are segregated so they don't inflate grass treatment rates.
          </p>
        </div>

        {/* Live Summary Chips */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl shrink-0">
          <div className="px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-lg text-xs font-bold">
            🌱 {totalLawn} m² Lawn
          </div>
          {totalHard > 0 && (
            <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">
              🧱 {totalHard} m² Hard Surface
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {areas.map((area, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-3"
            >
              {/* Zone Name */}
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={area.name}
                  onChange={(e) => handleUpdateZone(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Surface Type Toggle */}
              <div className="w-full sm:w-44">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Surface Type</label>
                <select
                  value={area.is_hard_surface ? 'hard' : 'lawn'}
                  onChange={(e) => handleUpdateZone(index, 'is_hard_surface', e.target.value === 'hard')}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="lawn">🌱 Lawn (Grass)</option>
                  <option value="hard">🧱 Hard Surface (Paved)</option>
                </select>
              </div>

              {/* Area Size (m2) */}
              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Size (m²)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={area.size}
                    onChange={(e) => handleUpdateZone(index, 'size', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">m²</span>
                </div>
              </div>

              {/* Delete button */}
              <div className="sm:self-end">
                <button
                  type="button"
                  onClick={() => handleRemoveZone(index)}
                  disabled={areas.length <= 1}
                  className="p-2.5 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddZone}
          className="flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl border border-brand-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Zone</span>
        </button>

        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm shadow-brand-500/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing Rate Cards...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Calculate Instant Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

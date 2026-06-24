import React, { useState } from 'react';
import { FarmerProfile, CropCategory } from '../types';
import { User, Layers, MapPin, Sparkles, Sprout, ShieldCheck } from 'lucide-react';

interface FarmerIdentityProps {
  profile: FarmerProfile;
  onChange: (updated: FarmerProfile) => void;
}

export default function FarmerIdentityCard({ profile, onChange }: FarmerIdentityProps) {
  const [name, setName] = useState(profile.name);
  const [state, setState] = useState(profile.state);
  const [district, setDistrict] = useState(profile.district);
  const [landSize, setLandSize] = useState(profile.landSizeHectares.toString());
  const [cropCategory, setCropCategory] = useState<CropCategory>(profile.cropCategory);
  const [mainCropsInput, setMainCropsInput] = useState(profile.mainCrops.join(', '));
  const [isEditing, setIsEditing] = useState(false);

  const indianStates = [
    "Andhra Pradesh",
    "Telangana",
    "West Bengal",
    "Punjab",
    "Maharashtra",
    "Rajasthan",
    "Madhya Pradesh",
    "Haryana",
    "Uttar Pradesh",
    "Tamil Nadu"
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cropsArray = mainCropsInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onChange({
      ...profile,
      name: name || "Prasad Rao",
      state: state || "Andhra Pradesh",
      district: district || "Nellore",
      landSizeHectares: parseFloat(landSize) || 1.8,
      cropCategory,
      mainCrops: cropsArray.length ? cropsArray : ["Paddy"],
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden" id="farmer-identity-card">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-200" />
          <span className="font-display font-bold tracking-wide text-sm opacity-90">GOVERNMENT AGRI-STACK GATEWAY</span>
        </div>
        <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
          Verified ID: {profile.farmerId}
        </span>
      </div>

      <div className="p-6">
        {!isEditing ? (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-gray-800 flex items-center gap-1.5">
                    {profile.name}
                    <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active Farmer
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">Farmer ID: {profile.farmerId}</p>
                </div>
              </div>
              <button
                id="edit-profile-btn"
                onClick={() => setIsEditing(true)}
                className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-medium px-4 py-2 rounded-xl transition"
              >
                Update Land Records
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-lime-50/50 p-3 rounded-xl border border-lime-100">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" /> Location
                </p>
                <p className="font-display font-semibold text-gray-800 text-sm mt-0.5">
                  {profile.district}, {profile.state}
                </p>
              </div>

              <div className="bg-lime-50/50 p-3 rounded-xl border border-lime-100">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-500" /> Land Area
                </p>
                <p className="font-display font-semibold text-gray-800 text-sm mt-0.5">
                  {profile.landSizeHectares} Hectares
                  <span className="text-[10px] text-gray-500 font-normal block">
                    (~{(profile.landSizeHectares * 2.47).toFixed(1)} Acres)
                  </span>
                </p>
              </div>

              <div className="bg-lime-50/50 p-3 rounded-xl border border-lime-100">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Sowing Season
                </p>
                <p className="font-display font-semibold text-emerald-800 text-sm mt-0.5 flex items-center gap-1">
                  {profile.cropCategory}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                </p>
              </div>

              <div className="bg-lime-50/50 p-3 rounded-xl border border-lime-100 font-sans">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-emerald-500" /> Sown Crops
                </p>
                <p className="font-display font-semibold text-gray-800 text-sm mt-0.5 truncate">
                  {profile.mainCrops.join(', ')}
                </p>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg flex items-center gap-2">
              <span className="font-bold">AgriStack Synced:</span>
              <span>Matched to {profile.state} land registry databases successfully. Your identity provides instant eligibility screening.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-gray-700 border-b border-gray-100 pb-2">
              Edit Land Registry Details (Mock AgriStack Link)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:outline-emerald-500 text-gray-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-2 py-2 bg-gray-50 focus:bg-white focus:outline-emerald-500 text-gray-800"
                  >
                    {indianStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">District / Block</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:outline-emerald-500 text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Land Size (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:outline-emerald-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Active Crop Cycle</label>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    {(['Kharif', 'Rabi', 'Zaid'] as CropCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCropCategory(cat)}
                        className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg transition ${
                          cropCategory === cat
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Main Grown Crops (comma separated)</label>
                <input
                  type="text"
                  value={mainCropsInput}
                  onChange={(e) => setMainCropsInput(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:outline-emerald-500 text-gray-800"
                  placeholder="e.g. Paddy, Cotton, Groundnut"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl transition shadow-sm"
              >
                Save Registry Sync
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

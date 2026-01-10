
import React, { useState } from 'react';
import { User, Mail, Shield, Save, Loader2, Camera } from 'lucide-react';
import { AdminProfile } from '../types';

interface ProfileSettingsProps {
  profile: AdminProfile;
  onUpdate: (profile: AdminProfile) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState<AdminProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdate(formData);
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="h-12 w-12 border border-white rounded-lg" />
              ))}
            </div>
          </div>
          
          <div className="relative inline-block group">
            <div className="w-32 h-32 rounded-[2rem] border-4 border-white overflow-hidden shadow-2xl bg-white">
              <img src={formData.avatar} className="w-full h-full object-cover" alt="avatar" />
            </div>
            <button className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <h2 className="mt-6 text-2xl font-black text-white">{formData.name}</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{formData.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Access Level</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  disabled
                  type="text"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-200/50 cursor-not-allowed font-bold"
                  value={formData.role}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all hover:scale-[1.02] shadow-2xl shadow-slate-900/10"
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            SAVE PROFILE CHANGES
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;

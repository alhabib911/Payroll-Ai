
import React, { useState } from 'react';
import { 
  User, Mail, Shield, Save, Loader2, Camera, 
  ShieldCheck, Globe, Key, Clock, Bell, Sparkles,
  Zap, Award, Fingerprint
} from 'lucide-react';
import { AdminProfile } from '../types';

interface ProfileSettingsProps {
  profile: AdminProfile;
  onUpdate: (profile: AdminProfile) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState<AdminProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'security'>('identity');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdate(formData);
    setIsSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card & Stats */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-3xl border border-[#f0f0f0] shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-[#001529] to-[#1677ff] relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>
            <div className="px-6 pb-8 text-center -mt-12 relative z-10">
              <div className="inline-block relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden group">
                  <img src={formData.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="avatar" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#52c41a] p-1.5 rounded-lg border-2 border-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-slate-900 tracking-tight">{formData.name}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{formData.role}</p>
              
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-[#1677ff] text-[9px] font-black uppercase rounded-full border border-blue-100">ZenVerified</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-full border border-slate-100">Premium Tier</span>
              </div>
            </div>
          </div>

          {/* Account Metrics Card */}
          <div className="bg-[#001529] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Zap className="w-16 h-16" />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Account Performance</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-xs font-medium">Payroll Accuracy</p>
                  <p className="text-xl font-bold">100%</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs font-medium">Logs Cleared</p>
                  <p className="text-xl font-bold">2.4k</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#52c41a] w-[92%]" />
              </div>
              <p className="text-[10px] text-white/40 font-bold italic leading-tight">Your account is in the top 5% of payroll efficiency this quarter.</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-[#f0f0f0] shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <Award className="w-4 h-4 text-[#faad14]" />
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Active Permissions</h4>
             </div>
             <div className="flex flex-wrap gap-2">
                {['Direct Disbursement', 'AI Audit', 'Bulk Export', 'Cross-Entity Ledger'].map(perm => (
                  <span key={perm} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{perm}</span>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Detailed Settings */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl border border-[#f0f0f0] shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-[#f0f0f0] px-8 bg-[#fafafa]">
              <button 
                onClick={() => setActiveSubTab('identity')}
                className={`px-6 py-5 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeSubTab === 'identity' ? 'text-[#1677ff]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Personal Identity
                {activeSubTab === 'identity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]" />}
              </button>
              <button 
                onClick={() => setActiveSubTab('security')}
                className={`px-6 py-5 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeSubTab === 'security' ? 'text-[#1677ff]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Vault & Security
                {activeSubTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]" />}
              </button>
            </div>

            <div className="p-8">
              {activeSubTab === 'identity' ? (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Legal Name
                      </label>
                      <input 
                        type="text"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#1677ff]/10 focus:border-[#1677ff] font-bold text-slate-700 transition-all shadow-sm"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Authorized Work Email
                      </label>
                      <input 
                        type="email"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#1677ff]/10 focus:border-[#1677ff] font-bold text-slate-700 transition-all shadow-sm"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Regional Format
                      </label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#1677ff]/10 focus:border-[#1677ff] font-bold text-slate-700 transition-all shadow-sm">
                         <option>English (International)</option>
                         <option>Bengali (Regional)</option>
                         <option>Arabic (MENA)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Timezone
                      </label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#1677ff]/10 focus:border-[#1677ff] font-bold text-slate-700 transition-all shadow-sm">
                         <option>UTC +6 (Dhaka)</option>
                         <option>UTC +3 (Riyadh)</option>
                         <option>UTC -5 (New York)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#f0f0f0] flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-4 bg-[#1677ff] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#4096ff] transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/20 active:scale-100"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      SAVE IDENTITY CHANGES
                    </button>
                    <button type="button" className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-bold text-xs uppercase hover:bg-slate-50 transition-all">
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                     <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-[#1677ff]">
                        <Fingerprint className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800">Enhanced Security Status</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Your account is currently protected by 256-bit AES encryption. For critical actions like salary disbursement, a vault-password check is required.</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Vault Access Token</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input disabled type="password" value="************************" className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-300 font-mono text-sm" />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#1677ff] uppercase">Change</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-[#1677ff] transition-all cursor-pointer">
                         <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-slate-400 group-hover:text-[#1677ff]" />
                            <span className="text-xs font-bold text-slate-700">Two-Factor (2FA)</span>
                         </div>
                         <div className="w-10 h-6 bg-[#52c41a] rounded-full p-1 flex justify-end transition-all">
                            <div className="w-4 h-4 bg-white rounded-full" />
                         </div>
                      </div>
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-[#1677ff] transition-all cursor-pointer">
                         <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-slate-400 group-hover:text-[#1677ff]" />
                            <span className="text-xs font-bold text-slate-700">Security Alerts</span>
                         </div>
                         <div className="w-10 h-6 bg-[#52c41a] rounded-full p-1 flex justify-end transition-all">
                            <div className="w-4 h-4 bg-white rounded-full" />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#f0f0f0] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#faad14]">
                       <Sparkles className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase">Premium Security Shield Active</span>
                    </div>
                    <button className="text-[11px] font-black text-[#1677ff] uppercase tracking-widest hover:underline">Download Security Audit Log</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 py-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
             <span>PCI DSS Compliant</span>
             <span className="w-1 h-1 bg-slate-200 rounded-full" />
             <span>ISO 27001 Certified</span>
             <span className="w-1 h-1 bg-slate-200 rounded-full" />
             <span>SOC 2 Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

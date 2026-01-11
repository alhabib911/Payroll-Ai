
import React, { useState } from 'react';
import { Calendar, FileText, Send, Sparkles, Loader2, Info, CheckCircle, ArrowRight } from 'lucide-react';

interface LeaveRequestProps {
  onSubmit: (request: any) => Promise<void>;
}

const LeaveRequest: React.FC<LeaveRequestProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await onSubmit(formData);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '' });
        }, 3000);
    } catch (err) {
        alert("Submission failed");
    } finally {
        setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/10 border border-green-100">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted</h2>
        <p className="text-slate-400 font-medium">Your leave application is now in the HR audit queue.</p>
        <div className="mt-8 flex gap-2">
           <span className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Approval</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Time-Off Provisioning</h2>
          <p className="text-sm font-medium text-slate-400">Apply for jurisdictional leave entitlements with automated HR routing.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#f0f0f0] shadow-xl shadow-slate-200/40 space-y-6 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Leave Type</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-4 focus:ring-[#1677ff]/10 focus:border-[#1677ff] outline-none transition-all"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option>Annual</option>
                    <option>Sick</option>
                    <option>Emergency</option>
                    <option>Unpaid</option>
                  </select>
               </div>
               
               <div className="space-y-1.5 flex items-center justify-center md:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Duration</p>
                    <p className="text-2xl font-black text-[#1677ff]">{calculateDays()} <span className="text-xs font-bold text-slate-300">DAYS</span></p>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Start Date
                  </label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-[#1677ff] transition-all" 
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> End Date
                  </label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-[#1677ff] transition-all" 
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <FileText className="w-3 h-3" /> Professional Reason
               </label>
               <textarea 
                  required
                  rows={4}
                  placeholder="Provide context for your absence..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-[#1677ff] transition-all resize-none"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
               />
            </div>

            <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                disabled={loading || calculateDays() === 0}
                className="flex-1 py-4 bg-[#1677ff] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#4096ff] transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/20 disabled:bg-slate-200 disabled:scale-100 disabled:shadow-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                TRANSMIT APPLICATION
              </button>
            </div>
          </div>
        </form>

        <div className="lg:w-80 space-y-6">
           <div className="bg-[#001529] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-16 h-16" />
              </div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Entitlement Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Annual Leave</span>
                  <span className="text-sm font-bold">14 / 20</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <div className="h-full bg-[#52c41a] w-[70%]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Sick Leave</span>
                  <span className="text-sm font-bold">8 / 10</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <div className="h-full bg-[#faad14] w-[80%]" />
                </div>
              </div>
           </div>

           <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
              <div className="flex gap-3 mb-3">
                 <Info className="w-4 h-4 text-[#1677ff]" />
                 <h4 className="text-[10px] font-black uppercase text-[#1677ff] tracking-widest">Policy Note</h4>
              </div>
              <p className="text-[11px] text-blue-800/70 leading-relaxed italic">Applications must be submitted 48 hours in advance for non-emergency leave to ensure resource allocation.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;

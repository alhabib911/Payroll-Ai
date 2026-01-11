
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, Calendar, Check, X, CreditCard, Ban } from 'lucide-react';
import { LeaveRequest, Employee, Language } from '../types';
import { translations } from '../translations';

interface LeaveManagementProps {
  requests: LeaveRequest[];
  employees: Employee[];
  onUpdateStatus: (id: string, status: 'Approved' | 'Rejected', paymentStatus?: 'Paid' | 'Unpaid') => Promise<void>;
  language: Language;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ requests, employees, onUpdateStatus, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState<string | null>(null);

  const t = translations[language];
  const getEmp = (id: string) => employees.find(e => e.id === id);

  const filteredRequests = requests.filter(req => {
    const emp = getEmp(req.employeeId);
    const matchesSearch = emp?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || req.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (id: string, status: 'Approved' | 'Rejected', paymentStatus?: 'Paid' | 'Unpaid') => {
    setProcessingId(id);
    await onUpdateStatus(id, status, paymentStatus);
    setProcessingId(null);
    setShowApprovalDialog(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.leaveManagement}</h2>
          <p className="text-xs font-medium text-slate-400">Review and authorize employee leave entitlements.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#f0f0f0] shadow-xl overflow-hidden">
        <div className="p-6 bg-[#fafafa] border-b border-[#f0f0f0] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search applications..." className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${filter === f ? 'bg-[#1677ff] text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#f0f0f0] text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Dates</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {filteredRequests.map((req) => {
                const emp = getEmp(req.employeeId);
                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.employeeId}`} className="w-10 h-10 rounded-2xl border border-slate-100" />
                        <div><p className="text-sm font-bold text-slate-800">{emp?.name}</p><p className="text-[10px] text-slate-400 uppercase">{emp?.department}</p></div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-700"><Calendar className="w-3 h-3 text-slate-400" /> {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</div>
                      <p className="text-[11px] text-slate-400 italic truncate max-w-[150px]">{req.reason}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${req.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : req.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {req.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : req.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {req.status}
                      </div>
                      {req.paymentStatus && <p className="mt-1 text-[9px] font-black uppercase text-slate-400">[{req.paymentStatus}]</p>}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setShowApprovalDialog(req.id)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"><Check className="w-4 h-4" /></button>
                           <button onClick={() => handleAction(req.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><X className="w-4 h-4" /></button>
                        </div>
                      ) : <span className="text-[9px] font-black text-slate-300 uppercase italic">Archived</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showApprovalDialog && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
           <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Authorize Leave</h3>
              <p className="text-xs font-medium text-slate-400 mb-8">Choose the payment status for this approved absence.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => handleAction(showApprovalDialog, 'Approved', 'Paid')} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:border-green-400 hover:bg-green-50 transition-all group">
                    <CreditCard className="w-6 h-6 text-slate-300 group-hover:text-green-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-green-600">PAID</span>
                 </button>
                 <button onClick={() => handleAction(showApprovalDialog, 'Approved', 'Unpaid')} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all group">
                    <Ban className="w-6 h-6 text-slate-300 group-hover:text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-amber-600">UNPAID</span>
                 </button>
              </div>
              <button onClick={() => setShowApprovalDialog(null)} className="mt-8 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest">CANCEL</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;

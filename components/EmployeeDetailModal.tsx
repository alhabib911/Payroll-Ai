
import React, { useState, useEffect } from 'react';
import { 
  X, Mail, MapPin, Building2, Calendar, Wallet, PieChart, BadgeCheck, 
  Edit3, Save, Power, PowerOff, ArrowLeft, History, Loader2, DollarSign
} from 'lucide-react';
import { Employee, PayrollRecord } from '../types';
import { COUNTRIES } from '../constants';
import { api } from '../api';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onUpdate?: (updated: Employee) => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose, onUpdate }) => {
  const [view, setView] = useState<'details' | 'edit' | 'history'>('details');
  const [formData, setFormData] = useState<Employee>(employee);
  const [history, setHistory] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const country = COUNTRIES[employee.country];

  useEffect(() => {
    if (view === 'history') {
      const fetchHistory = async () => {
        setLoading(true);
        const records = await api.getPayrollRecords(employee.companyId);
        setHistory(records.filter(r => r.employeeId === employee.id));
        setLoading(false);
      };
      fetchHistory();
    }
  }, [view, employee.id, employee.companyId]);

  const handleToggleStatus = async () => {
    const newStatus = formData.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...formData, status: newStatus as 'Active' | 'Inactive' };
    setFormData(updated);
    
    try {
        await api.updateEmployee(updated);
        if (onUpdate) onUpdate(updated);
    } catch (err) {
        alert("Status update failed");
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
        const updated = await api.updateEmployee(formData);
        if (onUpdate) onUpdate(updated);
        setView('details');
    } catch (err) {
        alert("Update failed");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData.salaryStructure) => {
    const val = e.target.value === '' ? 0 : Number(e.target.value);
    setFormData({
        ...formData,
        salaryStructure: {
            ...formData.salaryStructure,
            [field]: val
        }
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            {view === 'details' ? (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`} alt={employee.name} className="w-16 h-16 rounded-full bg-white border border-[#f0f0f0] shadow-sm" />
            ) : (
                <button onClick={() => setView('details')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#1677ff] transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{view === 'edit' ? 'Edit Profile' : view === 'history' ? 'Ledger History' : formData.name}</h2>
                {view === 'details' && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${formData.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {formData.status}
                    </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{view === 'details' ? formData.role : `System ID: ${employee.id}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'details' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Communication</p>
                      <p className="text-sm font-medium text-slate-700">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</p>
                      <p className="text-sm font-medium text-slate-700">{country.name}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                      <p className="text-sm font-medium text-slate-700">{formData.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Commencement</p>
                      <p className="text-sm font-medium text-slate-700">{new Date(employee.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f9fa] rounded border border-[#f0f0f0] p-5">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#f0f0f0]">
                  <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#1677ff]" /> Financial Structure
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                    <BadgeCheck className="w-3.5 h-3.5" /> VERIFIED
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Basic Emoluments</span>
                    <span className="font-bold text-slate-800">{country.symbol}{formData.salaryStructure.basic.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Housing Benefit (HRA)</span>
                    <span className="font-bold text-slate-800">{country.symbol}{formData.salaryStructure.hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commute & Medical</span>
                    <span className="font-bold text-slate-800">{country.symbol}{(formData.salaryStructure.transport + formData.salaryStructure.medical).toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-[#f0f0f0] flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Monthly Cost</span>
                    <span className="text-lg font-bold text-[#1677ff]">
                      {country.symbol}{(formData.salaryStructure.basic + formData.salaryStructure.hra + formData.salaryStructure.transport + formData.salaryStructure.medical).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'edit' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                        <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-[#1677ff] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Work Email</label>
                        <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-[#1677ff] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                        <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-[#1677ff] outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                        <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-[#1677ff] outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-[#1677ff] uppercase mb-4 tracking-widest">Financial Override</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Basic ({country.symbol})</label>
                            <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-blue-500 outline-none" value={formData.salaryStructure.basic} onChange={e => handleNumericInput(e, 'basic')} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">HRA ({country.symbol})</label>
                            <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-blue-500 outline-none" value={formData.salaryStructure.hra} onChange={e => handleNumericInput(e, 'hra')} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Account Status</label>
                    <button 
                        onClick={handleToggleStatus}
                        className={`flex items-center justify-center gap-2 py-3 rounded font-bold text-xs uppercase transition-all ${formData.status === 'Active' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
                    >
                        {formData.status === 'Active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {formData.status === 'Active' ? 'DEACTIVATE ACCOUNT' : 'RE-ACTIVATE ACCOUNT'}
                    </button>
                </div>
            </div>
          )}

          {view === 'history' && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <span className="text-[10px] font-bold uppercase">Auditing Ledger...</span>
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-2">
                        {history.map(rec => (
                            <div key={rec.id} className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{rec.month} {rec.year}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-bold">{rec.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-[#1677ff]">{country.symbol}{rec.netSalary.toLocaleString()}</p>
                                    <p className="text-[9px] text-green-500 font-bold uppercase">DISBURSED</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 opacity-50">
                        <DollarSign className="w-12 h-12 mb-4" />
                        <span className="text-xs font-bold uppercase italic tracking-widest">No Payout Records Found</span>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#fafafa] border-t border-[#f0f0f0] flex gap-2 shrink-0">
          {view === 'details' ? (
              <>
                <button 
                    onClick={() => setView('history')}
                    className="flex-1 py-2.5 bg-[#1677ff] text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-[#4096ff] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                >
                    <PieChart className="w-4 h-4" /> VIEW LEDGER HISTORY
                </button>
                <button 
                    onClick={() => setView('edit')}
                    className="px-6 py-2.5 bg-white border border-[#d9d9d9] text-slate-600 rounded font-bold text-xs uppercase hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                    <Edit3 className="w-4 h-4" /> EDIT PROFILE
                </button>
              </>
          ) : view === 'edit' ? (
              <button 
                  disabled={isSubmitting}
                  onClick={handleSave}
                  className="w-full py-3 bg-[#52c41a] text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-[#73d13d] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10"
              >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  SAVE CHANGES
              </button>
          ) : (
              <button 
                  onClick={() => setView('details')}
                  className="w-full py-3 bg-slate-800 text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                  RETURN TO DETAILS
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;

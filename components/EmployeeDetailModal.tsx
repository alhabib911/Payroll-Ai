
import React from 'react';
import { X, Mail, MapPin, Building2, Calendar, Wallet, PieChart, BadgeCheck } from 'lucide-react';
import { Employee } from '../types';
import { COUNTRIES } from '../constants';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose }) => {
  const country = COUNTRIES[employee.country];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400">
        <div className="p-6 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`} alt={employee.name} className="w-16 h-16 rounded-full bg-white border border-[#f0f0f0] shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{employee.name}</h2>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${employee.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {employee.status}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{employee.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Communication</p>
                  <p className="text-sm font-medium text-slate-700">{employee.email}</p>
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
                  <p className="text-sm font-medium text-slate-700">{employee.department}</p>
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
                <span className="font-bold text-slate-800">{country.symbol}{employee.salaryStructure.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Housing Benefit (HRA)</span>
                <span className="font-bold text-slate-800">{country.symbol}{employee.salaryStructure.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commute & Medical</span>
                <span className="font-bold text-slate-800">{country.symbol}{(employee.salaryStructure.transport + employee.salaryStructure.medical).toLocaleString()}</span>
              </div>
              
              <div className="pt-3 border-t border-[#f0f0f0] flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Monthly Cost</span>
                <span className="text-lg font-bold text-[#1677ff]">
                  {country.symbol}{(employee.salaryStructure.basic + employee.salaryStructure.hra + employee.salaryStructure.transport + employee.salaryStructure.medical).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#fafafa] border-t border-[#f0f0f0] flex gap-2">
          <button className="flex-1 py-2.5 bg-[#1677ff] text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-[#4096ff] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10">
            <PieChart className="w-4 h-4" /> VIEW LEDGER HISTORY
          </button>
          <button className="px-6 py-2.5 bg-white border border-[#d9d9d9] text-slate-600 rounded font-bold text-xs uppercase hover:bg-white transition-all">
            EDIT PROFILE
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;

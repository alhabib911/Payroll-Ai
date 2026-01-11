
import React, { useState } from 'react';
import { ShieldCheck, User, ShieldAlert, Loader2, Search, Briefcase, Lock, UserCheck, PowerOff, UserMinus, ShieldQuestion, CheckCircle2 } from 'lucide-react';
import { Employee, UserRole, Language } from '../types';
import { translations } from '../translations';
import ConfirmationModal from './ConfirmationModal';

interface RoleManagementProps {
  employees: Employee[];
  onRoleUpdate: (empId: string, newRole: UserRole) => Promise<void>;
  onRevokeAccess: (empId: string) => Promise<void>;
  onToggleActivation: (empId: string, status: 'Active' | 'Inactive') => Promise<void>;
  language: Language;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ employees, onRoleUpdate, onRevokeAccess, onToggleActivation, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  
  const t = translations[language];

  const roleConfig: Record<UserRole, { color: string, bg: string, icon: any }> = {
    Admin: { color: 'text-red-600', bg: 'bg-red-50', icon: ShieldAlert },
    HR: { color: 'text-blue-600', bg: 'bg-blue-50', icon: ShieldCheck },
    Accountant: { color: 'text-purple-600', bg: 'bg-purple-50', icon: Briefcase },
    Employee: { color: 'text-slate-600', bg: 'bg-slate-50', icon: User }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split into active and pending activation
  const pendingUsers = filteredEmployees.filter(e => e.status === 'Inactive');
  const activeUsers = filteredEmployees.filter(e => e.status === 'Active');

  const handleRoleChange = async (empId: string, newRole: UserRole) => {
    setUpdatingId(empId);
    try {
        await onRoleUpdate(empId, newRole);
    } finally {
        setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (empId: string, currentStatus: 'Active' | 'Inactive') => {
    setUpdatingId(empId);
    try {
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        await onToggleActivation(empId, nextStatus);
    } finally {
        setUpdatingId(null);
    }
  };

  const confirmRevocation = async () => {
    if (!revokingId) return;
    try {
        await onRevokeAccess(revokingId);
    } finally {
        setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Identity Control</h2>
          <p className="text-xs font-medium text-slate-400">Master Audit: Activate new signups and define organizational access hierarchy.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[#001529] rounded-2xl border border-white/5 shadow-xl">
           <ShieldCheck className="w-4 h-4 text-[#1677ff]" />
           <span className="text-[10px] font-black uppercase text-white/80 tracking-widest">Master Audit Active</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Lookup user by name or email..." 
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/5 outline-none transition-all text-sm font-medium shadow-sm shadow-slate-200/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Pending Approval Section */}
      {pendingUsers.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-2">
            <ShieldQuestion className="w-5 h-5 text-amber-500" />
            <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Awaiting System Authorization ({pendingUsers.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xl shadow-amber-500/5 flex items-center justify-between group hover:border-amber-300 transition-all border-dashed">
                <div className="flex items-center gap-4">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200" alt="avatar" />
                   <div>
                     <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[120px]">{user.email}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleToggleStatus(user.id, 'Inactive')}
                  className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-green-50 hover:text-green-600 transition-all shadow-sm border border-amber-100 hover:border-green-200"
                  title="Approve for Login"
                >
                  {updatingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active System Users Ledger */}
      <div className="bg-white rounded-3xl border border-[#f0f0f0] shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Active System Accounts</h3>
          </div>
          <span className="text-[9px] font-black text-[#1677ff] uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{activeUsers.length} GRANTED ACCESS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#f0f0f0] text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                <th className="px-8 py-5">Profile Identity</th>
                <th className="px-8 py-5">Authorization Tier</th>
                <th className="px-8 py-5 text-right">System Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {activeUsers.map(emp => {
                const isUpdating = updatingId === emp.id;
                const currentRole: UserRole = emp.systemRole || 'Employee'; 

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm" alt="avatar" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${roleConfig[currentRole].bg} ${roleConfig[currentRole].color}`}>
                          {React.createElement(roleConfig[currentRole].icon, { className: "w-3.5 h-3.5" })}
                          <span className="text-[10px] font-black uppercase tracking-wider">{currentRole}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{emp.department}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="relative">
                           <select 
                            disabled={isUpdating}
                            className="appearance-none px-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-600 focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/5 outline-none transition-all cursor-pointer pr-12 shadow-sm"
                            value={currentRole}
                            onChange={(e) => handleRoleChange(emp.id, e.target.value as UserRole)}
                          >
                            <option value="Admin">Master Admin</option>
                            <option value="HR">HR Manager</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Employee">Employee</option>
                          </select>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleToggleStatus(emp.id, 'Active')}
                            className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100"
                            title="Suspend System Access"
                          >
                             <PowerOff className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setRevokingId(emp.id)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Delete System Profile"
                          >
                             <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                        {isUpdating && <Loader2 className="w-5 h-5 text-[#1677ff] animate-spin" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeUsers.length === 0 && (
            <div className="py-24 text-center">
               <ShieldQuestion className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-300 italic text-sm font-bold uppercase tracking-widest">No verified system accounts on record.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={!!revokingId}
        title="Delete System Identity?"
        message="This user profile and all associated jurisdictional payroll data will be purged. This action is terminal and cannot be undone."
        onConfirm={confirmRevocation}
        onCancel={() => setRevokingId(null)}
        confirmText="PERMANENT PURGE"
        type="danger"
      />
    </div>
  );
};

export default RoleManagement;

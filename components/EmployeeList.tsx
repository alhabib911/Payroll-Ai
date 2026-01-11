
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  MapPin, 
  ArrowRight, 
  X, 
  Loader2,
  Building2,
  Trash2,
  Tag
} from 'lucide-react';
import { Employee, Country, SalaryStructure, UserRole } from '../types';
import { COUNTRIES } from '../constants';
import EmployeeDetailModal from './EmployeeDetailModal';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => Promise<void>;
  onUpdateEmployee?: (employee: Employee) => void;
  companyId: string;
  userRole: UserRole;
  departments: string[];
  onAddDepartment: (dept: string) => Promise<void>;
  onDeleteDepartment: (dept: string) => Promise<void>;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  onAddEmployee, 
  onUpdateEmployee,
  companyId, 
  userRole,
  departments,
  onAddDepartment,
  onDeleteDepartment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newDeptName, setNewDeptName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: departments[0] || 'Default',
    country: 'BD' as Country,
    basic: 0,
    hra: 0,
    transport: 0,
    medical: 0
  });

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'Accountant') return;
    setIsSubmitting(true);
    
    const newEmployee: Employee = {
      id: 'EMP' + Math.floor(1000 + Math.random() * 9000),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      status: 'Active',
      country: formData.country,
      joinDate: new Date().toISOString().split('T')[0],
      companyId: companyId,
      systemRole: 'Employee', // Set default system role
      salaryStructure: {
        basic: formData.basic,
        hra: formData.hra,
        transport: formData.transport,
        medical: formData.medical,
        customItems: []
      }
    };

    try {
      await onAddEmployee(newEmployee);
      setIsModalOpen(false);
      setFormData({
        name: '', email: '', role: '', department: departments[0] || 'Default',
        country: 'BD', basic: 0, hra: 0, transport: 0, medical: 0
      });
    } catch (error) {
      alert("Error adding employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    await onAddDepartment(newDeptName.trim());
    setNewDeptName('');
  };

  const selectedCountrySymbol = COUNTRIES[formData.country]?.symbol || '৳';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Workforce Registry</h2>
          <p className="text-xs font-medium text-slate-400">Global jurisdictional employee management and provisioning.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {userRole !== 'Accountant' && (
            <>
              <button 
                onClick={() => setIsDeptModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50 transition-all"
              >
                <Tag className="w-3.5 h-3.5" />
                DEPARTMENTS
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1677ff] text-white rounded text-xs font-bold hover:bg-[#4096ff] transition-all shadow-md shadow-blue-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD EMPLOYEE
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#f0f0f0] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#fafafa] border-b border-[#f0f0f0]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter employees..." 
              className="w-full pl-9 pr-4 py-2 rounded border border-[#d9d9d9] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-slate-500 text-[11px] font-bold uppercase border-b border-[#f0f0f0]">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Jurisdiction</th>
                <th className="px-6 py-4">Est. CTC</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`} alt={emp.name} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${emp.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}
                    `}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{emp.role}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{emp.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{COUNTRIES[emp.country].name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">
                        {COUNTRIES[emp.country].symbol}{(emp.salaryStructure.basic + emp.salaryStructure.hra).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedEmployee(emp)}
                      className="p-1.5 text-slate-400 hover:text-[#1677ff] rounded hover:bg-white transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
          onUpdate={(updated) => {
            if (onUpdateEmployee) onUpdateEmployee(updated);
            setSelectedEmployee(null); // Optional: close or keep open with new data
          }}
        />
      )}

      {/* Dept Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#f0f0f0] flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Department Config</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="New Dept..."
                  className="flex-1 px-3 py-1.5 rounded border border-[#d9d9d9] text-sm focus:border-[#1677ff] outline-none"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddDept()}
                />
                <button onClick={handleAddDept} className="px-4 py-1.5 bg-[#1677ff] text-white rounded font-bold text-xs uppercase transition-all">ADD</button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded border border-[#f0f0f0] group">
                    <span className="text-xs font-medium text-slate-700">{dept}</span>
                    <button onClick={() => onDeleteDepartment(dept)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Drawer-like Sidebar Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[#f0f0f0] flex justify-between items-center bg-[#fafafa]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">Employee Onboarding</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-[#1677ff] tracking-widest border-b border-[#1677ff]/10 pb-1">Basic Identity</h4>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Full Legal Name</label>
                  <input required type="text" className="w-full px-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#1677ff] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Work Email</label>
                  <input required type="email" className="w-full px-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#1677ff] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-[#1677ff] tracking-widest border-b border-[#1677ff]/10 pb-1">Assignment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Designation</label>
                    <input required type="text" className="w-full px-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#1677ff] outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Department</label>
                    <select className="w-full px-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#1677ff] outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Hiring Country</label>
                  <select className="w-full px-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#1677ff] outline-none" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value as Country})}>
                    {Object.entries(COUNTRIES).map(([code, c]) => <option key={code} value={code}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#f0f0f0]">
                <h4 className="text-[10px] font-bold uppercase text-[#52c41a] tracking-widest border-b border-[#52c41a]/10 pb-1">Salary Component (Monthly)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Basic Base</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{selectedCountrySymbol}</span>
                      <input 
                        required 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full pl-8 pr-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#52c41a] outline-none" 
                        value={formData.basic} 
                        onChange={e => setFormData({...formData, basic: e.target.value === '' ? 0 : Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">HRA / Rent</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{selectedCountrySymbol}</span>
                      <input 
                        required 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full pl-8 pr-3 py-2 rounded border border-[#d9d9d9] text-sm focus:border-[#52c41a] outline-none" 
                        value={formData.hra} 
                        onChange={e => setFormData({...formData, hra: e.target.value === '' ? 0 : Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-[#f0f0f0] bg-[#fafafa]">
              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-[#1677ff] text-white rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4096ff] transition-all shadow-lg shadow-blue-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                COMPLETE REGISTRATION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;

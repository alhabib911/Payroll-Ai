
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ShieldCheck, Loader2, AlertCircle, Info, Briefcase, UserPlus, Fingerprint } from 'lucide-react';
import { UserRole, AdminProfile, Employee } from '../types';
import { api } from '../api';

interface AuthProps {
  onLogin: (profile: AdminProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee' as UserRole
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const { email, password } = formData;
        
        // Comprehensive master credentials check
        const masterCredentials: Record<string, { role: UserRole, name: string, id?: string, pass: string }> = {
          'admin@zenpayroll.ai': { role: 'Admin', name: 'Master Admin', pass: 'admin123' },
          'hr@zenpayroll.ai': { role: 'HR', name: 'HR Manager', pass: 'hr123' },
          'acc@zenpayroll.ai': { role: 'Accountant', name: 'Senior Accountant', pass: 'acc123' },
          'emp@zenpayroll.ai': { role: 'Employee', name: 'Arif Rahman', id: 'EMP001', pass: 'emp123' }
        };

        const master = masterCredentials[email];
        if (master && password === master.pass) {
           onLogin({
            name: master.name,
            email: email,
            role: master.role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isLoggedIn: true,
            employeeId: master.id
          });
          return;
        }

        // Check dynamic users from the database/localStorage
        const allCompanies = await api.getCompanies();
        let foundUser: Employee | null = null;
        for (const company of allCompanies) {
          const employees = await api.getEmployees(company.id);
          const match = employees.find(emp => emp.email === email);
          if (match) {
            foundUser = match;
            break;
          }
        }

        if (foundUser) {
          if (foundUser.status === 'Inactive') {
            setError('Access Denied: Your account is currently Inactive. Please contact a Master Admin for activation.');
          } else {
            onLogin({
              name: foundUser.name,
              email: foundUser.email,
              role: foundUser.systemRole,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.id}`,
              isLoggedIn: true,
              employeeId: foundUser.id
            });
          }
        } else {
          setError('Authentication Failure: Identity or Keycode is incorrect.');
        }
      } else {
        // Signup Flow
        const newEmployee: Employee = {
          id: 'USR' + Date.now(),
          name: formData.name,
          email: formData.email,
          role: 'New User',
          department: 'Unassigned',
          status: 'Inactive', // Initial state is always inactive for new signups
          country: 'BD',
          joinDate: new Date().toISOString().split('T')[0],
          companyId: 'C001',
          systemRole: 'Employee',
          salaryStructure: { basic: 0, hra: 0, transport: 0, medical: 0, customItems: [] }
        };
        await api.addEmployee(newEmployee);
        setSuccessMsg('Registry Entry Created! Your account is pending Master Admin authorization.');
        setIsLogin(true);
      }
    } catch (err) {
      setError('System Error: Central Authentication Registry is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (email: string, pass: string) => {
    setIsLogin(true);
    setFormData(prev => ({ ...prev, email, password: pass }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px] animate-in zoom-in-95 duration-500">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl shadow-blue-500/5 mb-4 border border-blue-50">
            <Sparkles className="w-8 h-8 text-[#1677ff]" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ZenPayroll AI</h1>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.3em]">Central Authentication Portal</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-50 bg-slate-50/30">
            <button 
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${isLogin ? 'text-[#1677ff]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1677ff] rounded-t-full" />}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${!isLogin ? 'text-[#1677ff]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Request Access
              {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1677ff] rounded-t-full" />}
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-600 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Legal Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required 
                      type="text" 
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/5 outline-none text-sm font-bold transition-all bg-white" 
                      placeholder="e.g. John Doe"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    type="email" 
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/5 outline-none text-sm font-bold transition-all bg-white" 
                    placeholder="name@zenpayroll.ai"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Secure Keycode</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    type="password" 
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/5 outline-none text-sm font-bold transition-all bg-white" 
                    placeholder="••••••••"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-[#1677ff] text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#4096ff] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? <Fingerprint className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLogin ? 'Authorize Access' : 'Register Identity'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Default Audit Credentials
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setDemoCredentials('admin@zenpayroll.ai', 'admin123')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#1677ff] hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-700 uppercase leading-none">Admin</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">admin@zenpayroll.ai</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 group-hover:text-[#1677ff] uppercase">Key: admin123</span>
                </button>

                <button 
                  onClick={() => setDemoCredentials('hr@zenpayroll.ai', 'hr123')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#1677ff] hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-700 uppercase leading-none">HR Manager</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">hr@zenpayroll.ai</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 group-hover:text-[#1677ff] uppercase">Key: hr123</span>
                </button>

                <button 
                  onClick={() => setDemoCredentials('acc@zenpayroll.ai', 'acc123')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#1677ff] hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-700 uppercase leading-none">Accountant</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">acc@zenpayroll.ai</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 group-hover:text-[#1677ff] uppercase">Key: acc123</span>
                </button>

                <button 
                  onClick={() => setDemoCredentials('emp@zenpayroll.ai', 'emp123')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#1677ff] hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-700 uppercase leading-none">Employee</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">emp@zenpayroll.ai</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 group-hover:text-[#1677ff] uppercase">Key: emp123</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center flex justify-center gap-6 opacity-30 grayscale">
           <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default Auth;

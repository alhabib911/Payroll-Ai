
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ShieldCheck, Loader2, AlertCircle, Info } from 'lucide-react';
import { UserRole, AdminProfile } from '../types';

interface AuthProps {
  onLogin: (profile: AdminProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin' as UserRole
  });

  const validateAndLogin = () => {
    const { email, password } = formData;
    let loggedInRole: UserRole = 'Admin';
    let userName = 'Administrator';

    if (email === 'admin@zenpayroll.ai' && password === 'admin123') {
      loggedInRole = 'Admin';
      userName = 'Master Admin';
    } else if (email === 'hr@zenpayroll.ai' && password === 'hr123') {
      loggedInRole = 'HR';
      userName = 'HR Manager';
    } else if (email === 'acc@zenpayroll.ai' && password === 'acc123') {
      loggedInRole = 'Accountant';
      userName = 'Senior Accountant';
    } else {
      if (!isLogin) {
        loggedInRole = formData.role;
        userName = formData.name || 'New User';
      } else {
        return { success: false, message: 'Access denied. Use master credentials below for demo.' };
      }
    }

    return {
      success: true,
      profile: {
        name: userName,
        email: email,
        role: loggedInRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isLoggedIn: true
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = validateAndLogin();
      if (result.success && result.profile) {
        onLogin(result.profile);
      } else {
        setError(result.message || 'Authentication failed');
      }
      setLoading(false);
    }, 1200);
  };

  const setDemoCredentials = (email: string, pass: string) => {
    setIsLogin(true);
    setFormData(prev => ({ ...prev, email, password: pass }));
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-lg shadow-2xl border border-[#f0f0f0] overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 pb-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#1677ff] p-3 rounded-lg shadow-lg shadow-blue-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ZenPayroll AI</h1>
          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Enterprise Payout Management</p>
        </div>

        {error && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-100 rounded flex items-center gap-2 text-red-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[11px] font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Administrator Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required type="text" className="w-full pl-9 pr-4 py-2.5 rounded border border-[#d9d9d9] focus:border-[#1677ff] outline-none text-sm transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">System ID / Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input required type="email" className="w-full pl-9 pr-4 py-2.5 rounded border border-[#d9d9d9] focus:border-[#1677ff] outline-none text-sm transition-all" placeholder="admin@zenpayroll.ai" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Vault Password</label>
              {isLogin && <button type="button" className="text-[10px] text-[#1677ff] font-bold hover:underline">FORGOT?</button>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input required type="password" className="w-full pl-9 pr-4 py-2.5 rounded border border-[#d9d9d9] focus:border-[#1677ff] outline-none text-sm transition-all" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1677ff] text-white rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4096ff] transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isLogin ? 'SIGN IN' : 'INITIALIZE SYSTEM'}
          </button>
        </form>

        <div className="px-8 pb-8">
          <div className="p-4 bg-slate-50 rounded border border-[#f0f0f0]">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
              <Info className="w-3 h-3" /> Master Audit Credentials
            </p>
            <div className="space-y-2">
              <button onClick={() => setDemoCredentials('admin@zenpayroll.ai', 'admin123')} className="w-full flex justify-between items-center text-[11px] font-bold text-slate-600 hover:text-[#1677ff] transition-colors">
                <span>Admin Access</span>
                <code className="bg-white px-2 py-0.5 rounded border border-[#d9d9d9]">admin@zenpayroll.ai</code>
              </button>
              <button onClick={() => setDemoCredentials('hr@zenpayroll.ai', 'hr123')} className="w-full flex justify-between items-center text-[11px] font-bold text-slate-600 hover:text-[#1677ff] transition-colors">
                <span>HR Manager</span>
                <code className="bg-white px-2 py-0.5 rounded border border-[#d9d9d9]">hr@zenpayroll.ai</code>
              </button>
            </div>
          </div>

          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="w-full mt-6 text-[11px] font-bold text-slate-400 hover:text-[#1677ff] transition-colors"
          >
            {isLogin ? "DON'T HAVE AN ACCOUNT? REGISTER" : "ALREADY REGISTERED? LOG IN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

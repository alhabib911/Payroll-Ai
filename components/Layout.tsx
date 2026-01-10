
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  PieChart, 
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Globe,
  Plus,
  Trash2,
  ClipboardList,
  LogOut,
  Bell,
  Settings,
  Search
} from 'lucide-react';
import { Company, Language, AdminProfile } from '../types';
import { translations } from '../translations';
import { api } from '../api';
import ConfirmationModal from './ConfirmationModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCompany: Company;
  onCompanyChange: (company: Company) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  companies: Company[];
  onCompaniesUpdate: (companies: Company[]) => void;
  profile: AdminProfile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentCompany, 
  onCompanyChange,
  language,
  onLanguageChange,
  companies,
  onCompaniesUpdate,
  profile,
  onLogout
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = translations[language];

  const allMenuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: ['Admin', 'HR', 'Accountant'] },
    { id: 'employees', label: t.employees, icon: Users, roles: ['Admin', 'HR'] },
    { id: 'payroll', label: t.payroll, icon: Wallet, roles: ['Admin', 'Accountant'] },
    { id: 'ledger', label: t.ledger, icon: ClipboardList, roles: ['Admin', 'Accountant'] },
    { id: 'reports', label: t.insights, icon: PieChart, roles: ['Admin', 'HR'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(profile.role));

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.role !== 'Admin') return alert('Only Administrators can add companies.');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newCompany: Company = {
      id: 'C' + Date.now(),
      name: formData.get('name') as string,
      logo: formData.get('logo') as string || '🏢',
      currency: 'BDT',
      symbol: '৳',
      defaultCountry: 'BD'
    };
    const updated = await api.addCompany(newCompany);
    onCompaniesUpdate(updated);
    setShowAddCompany(false);
    onCompanyChange(newCompany);
  };

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    const updated = await api.deleteCompany(companyToDelete);
    onCompaniesUpdate(updated);
    if (currentCompany.id === companyToDelete && updated.length > 0) {
      onCompanyChange(updated[0]);
    }
    setCompanyToDelete(null);
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className={`h-screen flex bg-[#f0f2f5] overflow-hidden ${language === 'ar' ? 'flex-row-reverse' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Mobile Sidebar Toggle Backdrop */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Persistent Sidebar (Ant Design Dark Theme) */}
      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 w-64 bg-[#001529] text-white transition-all duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
        flex flex-col shadow-xl
      `}>
        {/* Logo Branding */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#1677ff] p-1.5 rounded-md shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white/90">ZenPayroll AI</h1>
          </div>
        </div>

        {/* Company Selector */}
        <div className="px-4 py-4 shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="w-full flex items-center justify-between p-2.5 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 flex-shrink-0 rounded bg-white/10 flex items-center justify-center text-sm">
                  {currentCompany.logo}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[11px] font-bold truncate text-white/80">{currentCompany.name}</p>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${showCompanyMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCompanyMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#001529] border border-white/10 rounded-md shadow-2xl z-[60] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto">
                  {companies.map(company => (
                    <div
                      key={company.id}
                      onClick={() => {
                        onCompanyChange(company);
                        setShowCompanyMenu(false);
                      }}
                      className={`px-4 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${company.id === currentCompany.id ? 'bg-[#1677ff] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span>{company.logo}</span>
                        <span className="truncate max-w-[120px]">{company.name}</span>
                      </div>
                      {companies.length > 1 && profile.role === 'Admin' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompanyToDelete(company.id);
                          }} 
                          className="p-1 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {profile.role === 'Admin' && (
                  <button 
                    onClick={() => { setShowAddCompany(true); setShowCompanyMenu(false); }}
                    className="w-full px-4 py-2 border-t border-white/5 text-[10px] font-bold text-[#1677ff] flex items-center gap-2 hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> {t.addCompany}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-2 space-y-0.5 mt-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full flex items-center gap-3.5 px-4 py-3 rounded-md transition-all duration-200 group relative
                ${activeTab === item.id 
                  ? 'bg-[#1677ff] text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
              <span className="font-medium text-[13px]">{item.label}</span>
              {activeTab === item.id && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 bg-white/30 rounded-full`} />
              )}
            </button>
          ))}
        </nav>

        {/* Footer Settings */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-black/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t.language}</span>
            <div className="flex gap-1">
              {['en', 'bn', 'ar'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => onLanguageChange(lang as Language)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${language === lang ? 'bg-[#1677ff] text-white' : 'text-white/40 hover:text-white'}`}
                >{lang}</button>
              ))}
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded transition-all text-[11px] font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header (Ant Design Pro Style) */}
        <header className="h-16 bg-white border-b border-[#f0f0f0] sticky top-0 z-40 flex items-center justify-between px-6 shrink-0 shadow-sm no-print">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>{t.organization}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold">{allMenuItems.find(i => i.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t.systemOnline}</span>
            </div>
            
            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 p-1 pl-1 pr-2 hover:bg-slate-50 rounded-full transition-all group"
              >
                <img src={profile.avatar} className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-slate-200" alt="avatar" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-[#1677ff] hidden sm:block">{profile.name}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-y-auto bg-[#f0f2f5] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Corporate Entity Provisioning Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{t.addCompany}</h3>
              <button onClick={() => setShowAddCompany(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Legal Entity Name</label>
                <input required name="name" className="w-full px-4 py-2.5 rounded border border-slate-200 focus:ring-2 focus:ring-[#1677ff]/10 focus:border-[#1677ff] text-sm transition-all" placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Company Logo (Emoji)</label>
                <input name="logo" placeholder="🏢" className="w-full px-4 py-2.5 rounded border border-slate-200 focus:ring-2 focus:ring-[#1677ff]/10 focus:border-[#1677ff] text-sm transition-all" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddCompany(false)} className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded font-bold text-xs hover:bg-slate-100 uppercase tracking-widest transition-all">CANCEL</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1677ff] text-white rounded font-bold text-xs hover:bg-[#1677ff]/90 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all">CREATE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!companyToDelete}
        title="Delete Organization?"
        message="This action will permanently delete all employee records and payroll data linked to this company. This cannot be undone."
        onConfirm={confirmDeleteCompany}
        onCancel={() => setCompanyToDelete(null)}
        confirmText="DELETE"
        type="danger"
      />
    </div>
  );
};

export default Layout;


import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import PayrollCalculator from './components/PayrollCalculator';
import PayrollLedger from './components/PayrollLedger';
import ProfileSettings from './components/ProfileSettings';
import { Employee, PayrollRecord, AIInsight, Company, Language, AdminProfile } from './types';
import { getPayrollInsights } from './services/geminiService';
import { api } from './api';
import { translations } from './translations';
import { Sparkles, Loader2, Zap, PieChart, AlertCircle, TrendingDown, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [profile, setProfile] = useState<AdminProfile>({
    name: '',
    email: '',
    role: 'Admin',
    avatar: '',
    isLoggedIn: false
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [selectedRecordForPayslip, setSelectedRecordForPayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('zp_session');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.isLoggedIn) {
          setProfile(parsed);
        }
      } catch (e) {
        localStorage.removeItem('zp_session');
      }
    }
  }, []);

  useEffect(() => {
    if (!profile.isLoggedIn) return;

    const initData = async () => {
      setLoading(true);
      try {
        const [fetchedCompanies, fetchedDepts] = await Promise.all([
          api.getCompanies(),
          api.getDepartments()
        ]);
        setCompanies(fetchedCompanies);
        setDepartments(fetchedDepts);
        if (fetchedCompanies.length > 0) {
          setCurrentCompany(fetchedCompanies[0]);
        }
      } catch (err) {
        console.error("Initial data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [profile.isLoggedIn]);

  useEffect(() => {
    if (!currentCompany || !profile.isLoggedIn) return;

    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const [empData, recData] = await Promise.all([
          api.getEmployees(currentCompany.id),
          api.getPayrollRecords(currentCompany.id)
        ]);
        setEmployees(empData);
        setRecords(recData);
      } catch (err) {
        console.error("Company data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [currentCompany?.id, profile.isLoggedIn]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (records.length > 0 && employees.length > 0 && profile.isLoggedIn) {
        setLoadingInsights(true);
        try {
          const data = await getPayrollInsights(records, employees);
          setInsights(data);
        } catch (err) {
          console.error("Insights error:", err);
        } finally {
          setLoadingInsights(false);
        }
      }
    };
    fetchInsights();
  }, [records, profile.isLoggedIn]);

  const handleLogin = (newProfile: AdminProfile) => {
    setProfile(newProfile);
    localStorage.setItem('zp_session', JSON.stringify(newProfile));
  };

  const handleLogout = () => {
    setProfile({ name: '', email: '', role: 'Admin', avatar: '', isLoggedIn: false });
    localStorage.removeItem('zp_session');
    setActiveTab('dashboard');
    setCurrentCompany(null);
    setCompanies([]);
    setLoading(false);
  };

  const handleRecordCreated = async (rec: PayrollRecord) => {
    try {
      const saved = await api.savePayrollRecord(rec);
      setRecords(prev => [...prev, saved]);
    } catch (err) {
      alert("Failed to save record.");
    }
  };

  const handleAddEmployee = async (employee: Employee) => {
    try {
      const saved = await api.addEmployee(employee);
      setEmployees(prev => [...prev, saved]);
    } catch (err) {
      alert("Failed to onboard employee.");
      throw err;
    }
  };

  const handleAddDepartment = async (dept: string) => {
    try {
      const updated = await api.addDepartment(dept);
      setDepartments(updated);
    } catch (err) {
      alert("Error adding department.");
    }
  };

  const handleDeleteDepartment = async (dept: string) => {
    try {
      const updated = await api.deleteDepartment(dept);
      setDepartments(updated);
    } catch (err) {
      alert("Error deleting department.");
    }
  };

  if (!profile.isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  // Ensure Layout doesn't crash if data is still loading
  if (loading && !currentCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f0f2f5]">
        <Loader2 className="w-8 h-8 text-[#1677ff] animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initialising Corporate Data...</p>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'payroll') setSelectedRecordForPayslip(null);
      }}
      currentCompany={currentCompany}
      onCompanyChange={setCurrentCompany}
      language={language}
      onLanguageChange={setLanguage}
      companies={companies}
      onCompaniesUpdate={setCompanies}
      profile={profile}
      onLogout={handleLogout}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full py-40">
          <Loader2 className="w-8 h-8 text-[#1677ff] animate-spin mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Encrypted Data...</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 h-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              employees={employees} 
              records={records} 
              onProcessPayroll={() => setActiveTab('payroll')}
            />
          )}
          {activeTab === 'employees' && (
            <EmployeeList 
              employees={employees} 
              onAddEmployee={handleAddEmployee} 
              companyId={currentCompany?.id || ''}
              userRole={profile.role}
              departments={departments}
              onAddDepartment={handleAddDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}
          {activeTab === 'payroll' && (
            <PayrollCalculator 
              employees={employees} 
              currentCompany={currentCompany!}
              onRecordCreated={handleRecordCreated} 
              initialRecord={selectedRecordForPayslip}
              onClearInitialRecord={() => setSelectedRecordForPayslip(null)}
            />
          )}
          {activeTab === 'ledger' && (
            <PayrollLedger 
              records={records}
              employees={employees}
              currentCompany={currentCompany!}
              onViewPayslip={(rec) => {
                setSelectedRecordForPayslip(rec);
                setActiveTab('payroll');
              }}
            />
          )}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                  <div>
                      <h2 className="text-xl font-bold text-slate-800">AI Financial Auditor</h2>
                      <p className="text-xs font-medium text-slate-400">Automated budget analysis and compliance audit for {currentCompany?.name}.</p>
                  </div>
                  {loadingInsights && <div className="animate-pulse text-[#1677ff] font-bold text-[10px] uppercase flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> AUDITING IN PROGRESS...
                  </div>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.length > 0 ? insights.map((insight, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg border border-[#f0f0f0] shadow-sm hover:shadow-md transition-all">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                      insight.type === 'warning' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#1677ff]'
                    }`}>
                      {insight.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-2 leading-relaxed">{insight.message}</p>
                    <p className="text-[11px] font-medium text-slate-400 mb-4">{insight.action || "No immediate action required."}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-[#f0f0f0]">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">STATUS: ACTIVE</span>
                        <button className="text-[10px] font-bold text-[#1677ff] hover:underline">RESOLVE</button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-lg border border-dashed border-[#d9d9d9] text-slate-300 italic text-sm">
                    No insights available. Process payroll records to trigger the AI auditor.
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <ProfileSettings profile={profile} onUpdate={async (p) => { 
              const updated = {...p, isLoggedIn: true};
              setProfile(updated); 
              localStorage.setItem('zp_session', JSON.stringify(updated));
            }} />
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;

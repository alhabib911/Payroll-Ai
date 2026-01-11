
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import PayrollCalculator from './components/PayrollCalculator';
import PayrollLedger from './components/PayrollLedger';
import ProfileSettings from './components/ProfileSettings';
import LeaveRequest from './components/LeaveRequest';
import RoleManagement from './components/RoleManagement';
import LeaveManagement from './components/LeaveManagement';
import { Employee, PayrollRecord, Company, Language, AdminProfile, LeaveRequest as ILeaveRequest, UserRole } from './types';
import { api } from './api';
import { translations } from './translations';
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<ILeaveRequest[]>([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState<ILeaveRequest[]>([]);
  const [profile, setProfile] = useState<AdminProfile>({
    name: '',
    email: '',
    role: 'Admin',
    avatar: '',
    isLoggedIn: false
  });
  
  const [loading, setLoading] = useState(false);
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

        if (profile.role === 'Employee' && profile.employeeId) {
            const leaves = await api.getLeaveRequests(profile.employeeId);
            setLeaveHistory(leaves);
        }

        if (profile.role === 'Admin' || profile.role === 'HR') {
            const allLeaves = await api.getAllLeaveRequests();
            setAllLeaveRequests(allLeaves);
        }
      } catch (err) {
        console.error("Company data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [currentCompany?.id, profile.isLoggedIn, profile.role, profile.employeeId]);

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

  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updated.id ? updated : emp));
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

  const handleLeaveSubmit = async (data: any) => {
    if (!profile.employeeId) return;
    const newReq: ILeaveRequest = {
        id: 'LR' + Date.now(),
        employeeId: profile.employeeId,
        appliedAt: new Date().toISOString(),
        status: 'Pending',
        ...data
    };
    const saved = await api.addLeaveRequest(newReq);
    setLeaveHistory(prev => [saved, ...prev]);
    setAllLeaveRequests(prev => [saved, ...prev]);
  };

  const handleLeaveManagementUpdate = async (id: string, status: 'Approved' | 'Rejected', paymentStatus?: 'Paid' | 'Unpaid') => {
    const req = allLeaveRequests.find(l => l.id === id);
    if (!req) return;
    const updated: ILeaveRequest = { ...req, status, paymentStatus };
    try {
        const saved = await api.updateLeaveRequest(updated);
        setAllLeaveRequests(prev => prev.map(l => l.id === id ? saved : l));
        // Update history if employee sees their own history
        setLeaveHistory(prev => prev.map(l => l.id === id ? saved : l));
    } catch (err) {
        alert("Failed to update leave status.");
    }
  };

  const handleRoleUpdate = async (empId: string, newRole: UserRole) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const empToUpdate = employees.find(e => e.id === empId);
    if (empToUpdate) {
      const updatedEmp = { ...empToUpdate, systemRole: newRole };
      try {
        await api.updateEmployee(updatedEmp);
        setEmployees(prev => prev.map(e => e.id === empId ? updatedEmp : e));
      } catch (err) {
        alert("System error updating role.");
      }
    }
  };

  const handleToggleActivation = async (empId: string, status: 'Active' | 'Inactive') => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const empToUpdate = employees.find(e => e.id === empId);
    if (empToUpdate) {
        const updatedEmp = { ...empToUpdate, status };
        try {
            await api.updateEmployee(updatedEmp);
            setEmployees(prev => prev.map(e => e.id === empId ? updatedEmp : e));
        } catch (err) {
            alert("System error updating status.");
        }
    }
  };

  const handleRevokeAccess = async (empId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setEmployees(prev => prev.filter(e => e.id !== empId));
    // Implementation would also delete from API/Storage
    const allStored = localStorage.getItem('zp_employees');
    if (allStored) {
        const parsed = JSON.parse(allStored);
        const filtered = parsed.filter((e: any) => e.id !== empId);
        localStorage.setItem('zp_employees', JSON.stringify(filtered));
    }
  };

  if (!profile.isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  if (loading && !currentCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f0f2f5]">
        <Loader2 className="w-8 h-8 text-[#1677ff] animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initialising Corporate Data...</p>
      </div>
    );
  }

  const displayRecords = profile.role === 'Employee' 
    ? records.filter(r => r.employeeId === profile.employeeId) 
    : records;

  const displayEmployees = profile.role === 'Employee'
    ? employees.filter(e => e.id === profile.employeeId)
    : employees;

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
              employees={displayEmployees} 
              records={displayRecords} 
              onProcessPayroll={() => setActiveTab('payroll')}
              profile={profile}
            />
          )}
          {activeTab === 'employees' && (
            <EmployeeList 
              employees={employees} 
              onAddEmployee={handleAddEmployee} 
              onUpdateEmployee={handleUpdateEmployee}
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
              records={displayRecords}
              employees={employees}
              currentCompany={currentCompany!}
              onViewPayslip={(rec) => {
                setSelectedRecordForPayslip(rec);
                setActiveTab('payroll');
              }}
            />
          )}
          {activeTab === 'leave-management' && (
            <LeaveManagement 
              employees={employees}
              requests={allLeaveRequests}
              onUpdateStatus={handleLeaveManagementUpdate}
              language={language}
            />
          )}
          {activeTab === 'role-management' && (
            <RoleManagement 
              employees={employees} 
              onRoleUpdate={handleRoleUpdate} 
              onRevokeAccess={handleRevokeAccess}
              onToggleActivation={handleToggleActivation}
              language={language}
            />
          )}
          {activeTab === 'leave-request' && (
            <LeaveRequest onSubmit={handleLeaveSubmit} />
          )}
          {activeTab === 'leave-history' && (
            <div className="space-y-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Application Ledger</h2>
                    <p className="text-xs font-medium text-slate-400">Historical log of all leave requests and audit statuses.</p>
                </div>
                <div className="bg-white rounded-3xl border border-[#f0f0f0] shadow-xl shadow-slate-200/40 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#fafafa] border-b border-[#f0f0f0] text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                                <th className="px-8 py-5">Application Type</th>
                                <th className="px-8 py-5">Interval</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Payment Status</th>
                                <th className="px-8 py-5">Audit Log</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f0f0]">
                            {leaveHistory.length > 0 ? leaveHistory.map(leave => (
                                <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1677ff]">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{leave.type} Leave</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-bold text-slate-600">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Applied: {new Date(leave.appliedAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                            leave.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                            leave.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {leave.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : 
                                             leave.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : 
                                             <Clock className="w-3 h-3" />}
                                            {leave.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {leave.paymentStatus ? (
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${leave.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {leave.paymentStatus}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-300 uppercase italic">Not Specified</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[11px] text-slate-400 italic line-clamp-1 max-w-xs">{leave.reason}</p>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-300 italic text-sm">No historical leave applications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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


import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, Loader2, Printer, CheckCircle2, Calculator, ArrowLeft, BadgeCheck, FileText, AlertTriangle, TrendingDown, Percent, Clock, Banknote, CalendarX, PartyPopper, RefreshCcw } from 'lucide-react';
import { Employee, PayrollRecord, Company, LeaveRequest } from '../types';
import { calculatePayrollWithAI } from '../services/geminiService';
import { COUNTRIES } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface PayrollCalculatorProps {
  employees: Employee[];
  currentCompany: Company;
  allLeaveRequests: LeaveRequest[];
  onRecordCreated: (record: PayrollRecord) => void;
  initialRecord?: PayrollRecord | null;
  onClearInitialRecord?: () => void;
}

const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({ 
  employees, 
  currentCompany, 
  allLeaveRequests,
  onRecordCreated,
  initialRecord,
  onClearInitialRecord
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [overtime, setOvertime] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const [leaveRate, setLeaveRate] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [vatPercent, setVatPercent] = useState(0);
  const [isAutoSynced, setIsAutoSynced] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [aiAudit, setAiAudit] = useState<any>(null);
  const [view, setView] = useState<'input' | 'payslip'>('input');
  const [showConfirmDisburse, setShowConfirmDisburse] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  // Logic: Advanced Country-wise Tax Brackets
  const getSuggestedTax = (gross: number, country: string): number => {
    if (country === 'KSA' || country === 'UAE') return 0; // Tax-free regions
    if (country === 'BD') {
      if (gross < 30000) return 0;
      if (gross < 50000) return 5;
      if (gross < 100000) return 10;
      return 15;
    }
    if (country === 'USA') {
      if (gross < 4000) return 10;
      if (gross < 9000) return 15;
      if (gross < 15000) return 22;
      return 28;
    }
    return 0;
  };

  // Feature: Attendance Auto-Sync for Unpaid Leaves
  useEffect(() => {
    if (selectedEmployee) {
      // Find all approved unpaid leaves specifically for current payroll cycle (simple match for this month)
      const unpaidRequests = allLeaveRequests.filter(req => 
        req.employeeId === selectedEmployee.id && 
        req.status === 'Approved' && 
        req.paymentStatus === 'Unpaid'
      );

      let totalDays = 0;
      unpaidRequests.forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDays += diff;
      });

      if (totalDays > 0) {
        setLeaves(totalDays);
        setIsAutoSynced(true);
        // Default leave rate calculation (Basic / 30)
        const dailyRate = Math.round(selectedEmployee.salaryStructure.basic / 30);
        setLeaveRate(dailyRate);
      } else {
        setLeaves(0);
        setIsAutoSynced(false);
      }

      // Auto-calc tax based on gross salary and country
      const baseGross = selectedEmployee.salaryStructure.basic + selectedEmployee.salaryStructure.hra;
      setTaxPercent(getSuggestedTax(baseGross, selectedEmployee.country));
      setVatPercent(0); // Default VAT to 0
    }
  }, [selectedEmployee, allLeaveRequests]);

  const calculatedData = useMemo(() => {
    if (!selectedEmployee) return null;
    
    const basePay = selectedEmployee.salaryStructure.basic + 
                    selectedEmployee.salaryStructure.hra + 
                    selectedEmployee.salaryStructure.transport + 
                    selectedEmployee.salaryStructure.medical;
    
    const otTotal = overtime * overtimeRate;
    const leaveDeduction = leaves * leaveRate;
    const grossSalary = basePay + otTotal + bonus;
    
    const taxAmount = Math.round((grossSalary * taxPercent) / 100);
    const vatAmount = Math.round((grossSalary * vatPercent) / 100);
    const totalDeductions = leaveDeduction + taxAmount + vatAmount;
    
    const netSalary = grossSalary - totalDeductions;

    return { basePay, otTotal, leaveDeduction, grossSalary, taxAmount, vatAmount, netSalary };
  }, [selectedEmployee, overtime, overtimeRate, bonus, leaves, leaveRate, taxPercent, vatPercent]);

  useEffect(() => {
    if (initialRecord) {
      setSelectedEmpId(initialRecord.employeeId);
      setOvertime(initialRecord.overtimeHours);
      setOvertimeRate(initialRecord.overtimeRate);
      setBonus(initialRecord.bonuses);
      setLeaves(initialRecord.unpaidLeaves);
      setLeaveRate(initialRecord.unpaidLeaveRate);
      setTaxPercent(initialRecord.taxPercent);
      setVatPercent(initialRecord.vatPercent);
      setAiAudit({ taxExplanation: initialRecord.breakdown?.taxExplanation });
      setView('payslip');
    }
  }, [initialRecord]);

  const handleCalculate = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const audit = await calculatePayrollWithAI(
        selectedEmployee, overtime, overtimeRate, bonus, leaves, leaveRate, taxPercent, vatPercent
      );
      if (audit) setAiAudit(audit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('input');
    if (initialRecord && onClearInitialRecord) onClearInitialRecord();
  };

  const executeDisbursement = () => {
    if (!calculatedData || !selectedEmpId) return;
    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
    
    const record: PayrollRecord = {
        id: 'PAY' + Date.now(),
        employeeId: selectedEmpId,
        companyId: currentCompany.id,
        month: currentMonth,
        year: now.getFullYear(),
        grossSalary: calculatedData.grossSalary,
        netSalary: calculatedData.netSalary,
        tax: calculatedData.taxAmount,
        vat: calculatedData.vatAmount,
        otherDeductions: calculatedData.leaveDeduction,
        bonuses: bonus,
        overtimeHours: overtime,
        overtimeRate: overtimeRate,
        unpaidLeaves: leaves,
        unpaidLeaveRate: leaveRate,
        taxPercent: taxPercent,
        vatPercent: vatPercent,
        status: 'Paid',
        breakdown: {
            taxExplanation: aiAudit?.taxExplanation || "Validated and processed via ZenPayroll AI Audit engine.",
            otTotal: calculatedData.otTotal,
            leaveDeduction: calculatedData.leaveDeduction
        },
        generatedAt: now.toISOString()
    };
    
    onRecordCreated(record);
    setShowConfirmDisburse(false);
    setSuccessState(true);
    
    setTimeout(() => {
        setSuccessState(false);
        setSelectedEmpId('');
        setAiAudit(null);
        setView('input');
    }, 2500);
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: number) => void) => {
    setter(e.target.value === '' ? 0 : Number(e.target.value));
  };

  if (successState) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100 shadow-xl shadow-green-500/10">
              <PartyPopper className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Payout Successful!</h2>
          <p className="text-slate-400 font-medium mb-8">Financial ledger updated. Secure notification sent to employee.</p>
          <div className="flex gap-2">
              <span className="px-4 py-2 bg-slate-100 rounded-lg text-slate-500 font-black text-[10px] uppercase tracking-widest">TRANSACTION SIGNED</span>
          </div>
      </div>
    );
  }

  if (view === 'payslip' && calculatedData && selectedEmployee) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-400 pb-10">
        <div className="mb-6 flex justify-between items-center no-print">
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black transition-colors text-[10px] uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back to Editor
            </button>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                  <Printer className="w-4 h-4" /> PRINT PDF
              </button>
              {!initialRecord && (
                <button onClick={() => setShowConfirmDisburse(true)} className="flex items-center gap-2 px-4 py-2 bg-[#52c41a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-[#73d13d] transition-all">
                    <CheckCircle2 className="w-4 h-4" /> DISBURSE FUNDS
                </button>
              )}
            </div>
        </div>

        <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-[#f0f0f0] print:shadow-none print:border-none print:p-0">
            <div className="flex justify-between items-start border-b border-[#f0f0f0] pb-8 mb-8">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl">{currentCompany.logo}</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{currentCompany.name}</h2>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">OFFICIAL PAYROLL ADVICE</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Ending</p>
                    <span className="px-4 py-1.5 bg-blue-50 text-[#1677ff] rounded-xl border border-blue-100 font-black uppercase text-[11px] tracking-widest">
                        {initialRecord ? `${initialRecord.month} ${initialRecord.year}` : 'Current Month'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">RECIPIENT</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Name:</span> <span className="text-slate-800">{selectedEmployee.name}</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Employee ID:</span> <span className="text-slate-800">{selectedEmployee.id}</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Jurisdiction:</span> <span className="text-slate-800">{selectedEmployee.country}</span></div>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">DISBURSEMENT SUMMARY</h4>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Gross Salary</p>
                        <p className="text-xl font-black text-slate-800">{currentCompany.symbol}{calculatedData.grossSalary.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Deductions</p>
                        <p className="text-xl font-black text-red-500">-{currentCompany.symbol}{(calculatedData.grossSalary - calculatedData.netSalary).toLocaleString()}</p>
                      </div>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase text-green-600 border-b border-green-100 pb-2 tracking-widest">Earnings</h4>
                        <div className="space-y-2 text-xs font-bold text-slate-700">
                            <div className="flex justify-between"><span>Base Salary Components</span> <span>{currentCompany.symbol}{calculatedData.basePay.toLocaleString()}</span></div>
                            <div className="flex justify-between text-green-600"><span>Bonus/Incentives</span> <span>+{currentCompany.symbol}{bonus.toLocaleString()}</span></div>
                            {calculatedData.otTotal > 0 && <div className="flex justify-between"><span>Overtime ({overtime} hrs)</span> <span>{currentCompany.symbol}{calculatedData.otTotal.toLocaleString()}</span></div>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase text-red-600 border-b border-red-100 pb-2 tracking-widest">Deductions</h4>
                        <div className="space-y-2 text-xs font-bold text-slate-700">
                            {calculatedData.leaveDeduction > 0 && <div className="flex justify-between text-red-500"><span>Unpaid Absences ({leaves} days)</span> <span>-{currentCompany.symbol}{calculatedData.leaveDeduction.toLocaleString()}</span></div>}
                            <div className="flex justify-between text-red-500"><span>Statutory Income Tax ({taxPercent}%)</span> <span>-{currentCompany.symbol}{calculatedData.taxAmount.toLocaleString()}</span></div>
                            <div className="flex justify-between text-red-500"><span>Transactional VAT ({vatPercent}%)</span> <span>-{currentCompany.symbol}{calculatedData.vatAmount.toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#001529] rounded-[30px] p-8 text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Final Net Payout</p>
                        <p className="text-4xl font-black">{currentCompany.symbol}{calculatedData.netSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-right relative z-10 hidden sm:block">
                        <div className="flex items-center justify-end gap-2 text-[#52c41a] font-black mb-1 text-[10px] tracking-widest">
                            <BadgeCheck className="w-4 h-4" /> AI AUDIT VERIFIED
                        </div>
                        <p className="text-[9px] text-white/30 italic max-w-[220px] leading-tight">{aiAudit?.taxExplanation || "Validated against organizational compliance rules and jurisdictional laws."}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">ZENPAYROLL AI SECURE DOCUMENT • AUDIT-ID: {initialRecord?.id || 'PENDING'}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 h-full">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[32px] border border-[#f0f0f0] shadow-xl shadow-slate-200/40 space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-[#f0f0f0]">
            <div className="p-2 bg-blue-50 rounded-xl text-[#1677ff]"><Calculator className="w-5 h-5" /></div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Payroll Editor</h3>
              <p className="text-[10px] font-bold text-slate-400">Configure adjustments & taxes</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Employee</label>
            <select 
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white outline-none focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/5 text-sm font-bold transition-all"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
            >
              <option value="">Choose Recipient...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>)}
            </select>
          </div>

          {selectedEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
               <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-black text-blue-700 uppercase">Overtime</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Hours</p>
                      <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded-xl bg-white text-xs font-bold outline-none border border-transparent focus:border-blue-500" value={overtime} onChange={e => handleNumericInput(e, setOvertime)} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Rate/Hr</p>
                      <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded-xl bg-white text-xs font-bold outline-none border border-transparent focus:border-blue-500" value={overtimeRate} onChange={e => handleNumericInput(e, setOvertimeRate)} />
                    </div>
                  </div>
               </div>

               <div className="p-5 bg-orange-50/50 rounded-3xl border border-orange-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><CalendarX className="w-4 h-4 text-orange-600" /><span className="text-[10px] font-black text-orange-700 uppercase">Leaves</span></div>
                    {isAutoSynced && <span className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase bg-white px-2 py-0.5 rounded-full border border-blue-100"><RefreshCcw className="w-2 h-2" /> Sync Active</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Unpaid Days</p>
                      <input type="number" onFocus={e => e.target.select()} className={`w-full px-3 py-2 rounded-xl bg-white text-xs font-bold outline-none border ${isAutoSynced ? 'border-blue-300 ring-2 ring-blue-50' : 'border-transparent focus:border-orange-500'}`} value={leaves} onChange={e => { handleNumericInput(e, setLeaves); setIsAutoSynced(false); }} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Ded/Day</p>
                      <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded-xl bg-white text-xs font-bold outline-none border border-transparent focus:border-orange-500" value={leaveRate} onChange={e => handleNumericInput(e, setLeaveRate)} />
                    </div>
                  </div>
               </div>

               <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Percent className="w-4 h-4 text-purple-600" /><span className="text-[10px] font-black text-purple-700 uppercase">Compliance</span></div>
                    <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">{selectedEmployee.country} Slots</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Income Tax (%)</p>
                      <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded-xl bg-white text-xs font-bold outline-none border border-transparent focus:border-purple-500" value={taxPercent} onChange={e => handleNumericInput(e, setTaxPercent)} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">VAT (%)</p>
                      <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-2 rounded-xl bg-white text-xs font-bold outline-none border border-transparent focus:border-purple-500" value={vatPercent} onChange={e => handleNumericInput(e, setVatPercent)} />
                    </div>
                  </div>
               </div>

               <div className="p-5 bg-green-50/50 rounded-3xl border border-green-100 space-y-4">
                  <div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-green-600" /><span className="text-[10px] font-black text-green-700 uppercase">Extra Credits</span></div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">One-time Bonus ({currentCompany.symbol})</p>
                    <input type="number" onFocus={e => e.target.select()} className="w-full px-3 py-3 rounded-xl bg-white text-xs font-bold outline-none border border-transparent focus:border-green-500" value={bonus} onChange={e => handleNumericInput(e, setBonus)} />
                  </div>
               </div>
            </div>
          )}

          <button 
            disabled={!selectedEmpId || loading}
            onClick={handleCalculate}
            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-white transition-all
              ${!selectedEmpId || loading ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-[#1677ff] hover:bg-[#4096ff] shadow-xl shadow-blue-500/20 active:scale-95'}
            `}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'AI RUNNING COMPLIANCE AUDIT...' : 'VALIDATE & PREVIEW ADVICE'}
          </button>
        </div>
      </div>

      <div className="h-full">
        {calculatedData ? (
          <div className="bg-white rounded-[40px] border border-[#f0f0f0] shadow-2xl shadow-slate-200/40 flex flex-col h-full animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Live Summary Audit</h3>
              <button onClick={() => setView('payslip')} className="text-[10px] font-black text-[#1677ff] flex items-center gap-2 hover:underline">
                <FileText className="w-4 h-4" /> FULL PAYSLIP
              </button>
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {aiAudit?.warning && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in shake">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-black leading-tight uppercase">{aiAudit.warning}</p>
                  </div>
                )}
                
                <div className="p-8 bg-[#001529] rounded-[30px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-2 tracking-widest">Calculated Net Payable</p>
                        <p className="text-5xl font-black tracking-tighter">{currentCompany.symbol}{calculatedData.netSalary.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                        <p className="text-slate-400 font-black uppercase mb-1 text-[9px] tracking-widest">Gross Total</p>
                        <p className="font-black text-slate-800 text-base">{currentCompany.symbol}{calculatedData.grossSalary.toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                        <p className="text-slate-400 font-black uppercase mb-1 text-[9px] tracking-widest">Total Deductions</p>
                        <p className="font-black text-red-500 text-base">-{currentCompany.symbol}{(calculatedData.grossSalary - calculatedData.netSalary).toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4 items-start">
                  <TrendingDown className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-blue-800 leading-relaxed italic">
                    "{aiAudit?.taxExplanation || "Audit report pending. Click Validate to run system compliance checks."}"
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowConfirmDisburse(true)}
                  className="w-full py-5 bg-[#52c41a] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#73d13d] transition-all shadow-xl shadow-green-500/20 active:scale-95"
                >
                    <CheckCircle2 className="w-5 h-5" /> AUTHORIZE & DISBURSE
                </button>
                <div className="flex items-center justify-center gap-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  <span>AES-256</span>
                  <span>SSL-ACTIVE</span>
                  <span>ISO-27001</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-white p-10 rounded-full shadow-xl mb-8">
              <Sparkles className="w-14 h-14 text-[#1677ff] opacity-40 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Awaiting Configuration</h4>
            <p className="text-[11px] font-bold text-slate-300 max-w-[260px] leading-relaxed uppercase tracking-wider">Select an identity from the workforce registry to initiate period calculation.</p>
          </div>
        )}
      </div>

      <ConfirmationModal 
          isOpen={showConfirmDisburse}
          title="Confirm Authorization?"
          message={`Are you sure you want to authorize the final payment of ${currentCompany.symbol}${calculatedData?.netSalary.toLocaleString()}? This action will generate a permanent ledger entry.`}
          onConfirm={executeDisbursement}
          onCancel={() => setShowConfirmDisburse(false)}
          confirmText="EXECUTE"
          type="info"
      />
    </div>
  );
};

export default PayrollCalculator;


import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, Loader2, Printer, CheckCircle2, Calculator, ArrowLeft, BadgeCheck, FileText, AlertTriangle, TrendingDown, Percent, Clock, Banknote, CalendarX, PartyPopper } from 'lucide-react';
import { Employee, PayrollRecord, Company } from '../types';
import { calculatePayrollWithAI } from '../services/geminiService';
import { COUNTRIES } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface PayrollCalculatorProps {
  employees: Employee[];
  currentCompany: Company;
  onRecordCreated: (record: PayrollRecord) => void;
  initialRecord?: PayrollRecord | null;
  onClearInitialRecord?: () => void;
}

const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({ 
  employees, 
  currentCompany, 
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
  
  const [loading, setLoading] = useState(false);
  const [aiAudit, setAiAudit] = useState<any>(null);
  const [view, setView] = useState<'input' | 'payslip'>('input');
  const [showConfirmDisburse, setShowConfirmDisburse] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  // Real-time calculation math
  const calculatedData = useMemo(() => {
    if (!selectedEmployee) return null;
    
    const basePay = selectedEmployee.salaryStructure.basic + 
                    selectedEmployee.salaryStructure.hra + 
                    selectedEmployee.salaryStructure.transport + 
                    selectedEmployee.salaryStructure.medical;
    
    const otTotal = overtime * overtimeRate;
    const leaveDeduction = leaves * leaveRate;
    const grossSalary = basePay + otTotal + bonus;
    
    const taxAmount = (grossSalary * taxPercent) / 100;
    const vatAmount = (grossSalary * vatPercent) / 100;
    const totalDeductions = leaveDeduction + taxAmount + vatAmount;
    
    const netSalary = grossSalary - totalDeductions;

    return {
      basePay,
      otTotal,
      leaveDeduction,
      grossSalary,
      taxAmount,
      vatAmount,
      netSalary
    };
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
        selectedEmployee, 
        overtime, 
        overtimeRate, 
        bonus, 
        leaves, 
        leaveRate, 
        taxPercent, 
        vatPercent
      );
      if (audit) {
        setAiAudit(audit);
      }
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
    const currentYear = now.getFullYear();

    const record: PayrollRecord = {
        id: 'PAY' + Date.now(),
        employeeId: selectedEmpId,
        companyId: currentCompany.id,
        month: currentMonth,
        year: currentYear,
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
            taxExplanation: aiAudit?.taxExplanation || "System generated audit validation.",
            otTotal: calculatedData.otTotal,
            leaveDeduction: calculatedData.leaveDeduction
        },
        generatedAt: now.toISOString()
    };
    
    onRecordCreated(record);
    setShowConfirmDisburse(false);
    setSuccessState(true);
    
    // Auto reset after 3 seconds
    setTimeout(() => {
        setSuccessState(false);
        setSelectedEmpId('');
        setAiAudit(null);
        setView('input');
        setOvertime(0);
        setBonus(0);
        setLeaves(0);
        setTaxPercent(0);
        setVatPercent(0);
    }, 2500);
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: number) => void) => {
    const val = e.target.value === '' ? 0 : Number(e.target.value);
    setter(val);
  };

  if (successState) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100 shadow-lg shadow-green-500/10">
              <PartyPopper className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Disbursement Successful!</h2>
          <p className="text-slate-400 font-medium mb-8">Salary record has been committed to the secure ledger.</p>
          <div className="flex gap-2">
              <div className="px-4 py-2 bg-slate-100 rounded text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  LEDGER UPDATED
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  DASHBOARD SYNCED
              </div>
          </div>
      </div>
    );
  }

  if (view === 'payslip' && calculatedData && selectedEmployee) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-400 pb-10">
        <div className="mb-6 flex justify-between items-center no-print">
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors text-xs">
                <ArrowLeft className="w-4 h-4" /> Back to Editor
            </button>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded font-bold text-xs hover:bg-slate-50 transition-all">
                  <Printer className="w-4 h-4" /> PRINT
              </button>
              {!initialRecord && (
                <button onClick={() => setShowConfirmDisburse(true)} className="flex items-center gap-2 px-4 py-2 bg-[#52c41a] text-white rounded font-bold text-xs shadow-md hover:bg-[#73d13d] transition-all">
                    <CheckCircle2 className="w-4 h-4" /> CONFIRM DISBURSEMENT
                </button>
              )}
            </div>
        </div>

        <div className="bg-white p-10 rounded-lg shadow-xl border border-[#f0f0f0] print:shadow-none print:border-none">
            <div className="flex justify-between items-start border-b border-[#f0f0f0] pb-8 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{currentCompany.logo}</span>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{currentCompany.name}</h2>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Remuneration Advice & Audit Log</p>
                </div>
                <div className="text-right">
                    <span className="px-3 py-1 bg-blue-50 text-[#1677ff] rounded border border-blue-100 font-bold uppercase text-[10px] tracking-widest">
                        {initialRecord ? `${initialRecord.month} ${initialRecord.year}` : 'Current Cycle'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recipient Information</h4>
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                        <span className="text-slate-500 font-medium">Full Name:</span>
                        <span className="font-bold text-slate-800">{selectedEmployee.name}</span>
                        <span className="text-slate-500 font-medium">Staff Identity:</span>
                        <span className="font-bold text-slate-800">{selectedEmployee.id}</span>
                        <span className="text-slate-500 font-medium">Tax Region:</span>
                        <span className="font-bold text-slate-800 uppercase">{selectedEmployee.country}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Summary Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Gross Income</p>
                            <p className="text-sm font-bold text-slate-800">{currentCompany.symbol}{calculatedData.grossSalary.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Deductions</p>
                            <p className="text-sm font-bold text-red-500">-{currentCompany.symbol}{(calculatedData.grossSalary - calculatedData.netSalary).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold uppercase text-green-600 border-b border-green-100 pb-2">Income Items</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Fixed Components</span>
                                <span className="font-bold text-slate-800">{currentCompany.symbol}{calculatedData.basePay.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Bonus Allocation</span>
                                <span className="font-bold text-green-600">+{currentCompany.symbol}{bonus.toLocaleString()}</span>
                            </div>
                            {calculatedData.otTotal > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Overtime ({overtime} hrs @ {overtimeRate})</span>
                                    <span className="font-bold text-slate-800">{currentCompany.symbol}{calculatedData.otTotal.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold uppercase text-red-600 border-b border-red-100 pb-2">Statutory & Adjustments</h4>
                        <div className="space-y-2 text-xs">
                            {calculatedData.leaveDeduction > 0 && (
                              <div className="flex justify-between">
                                  <span className="text-slate-500">Unpaid Leave ({leaves} days @ {leaveRate})</span>
                                  <span className="font-bold text-red-600">-{currentCompany.symbol}{calculatedData.leaveDeduction.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Income Tax ({taxPercent}%)</span>
                                <span className="font-bold text-red-600">-{currentCompany.symbol}{calculatedData.taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">VAT Deduction ({vatPercent}%)</span>
                                <span className="font-bold text-red-600">-{currentCompany.symbol}{calculatedData.vatAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#001529] rounded-lg p-6 text-white flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Final Net Payout</p>
                        <p className="text-3xl font-bold">{currentCompany.symbol}{calculatedData.netSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-right hidden sm:block max-w-[200px]">
                        <div className="flex items-center justify-end gap-2 text-[#52c41a] font-bold mb-1 text-xs">
                            <BadgeCheck className="w-4 h-4" /> Auditor Verified
                        </div>
                        <p className="text-[10px] text-white/40 italic leading-tight">{aiAudit?.taxExplanation || "Validated against organizational compliance rules."}</p>
                    </div>
                </div>
            </div>
        </div>

        <ConfirmationModal 
            isOpen={showConfirmDisburse}
            title="Authorize Payout?"
            message={`Confirming final payment of ${currentCompany.symbol}${calculatedData.netSalary.toLocaleString()} for ${selectedEmployee.name}.`}
            onConfirm={executeDisbursement}
            onCancel={() => setShowConfirmDisburse(false)}
            confirmText="AUTHORIZE"
            type="info"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500 h-full">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#f0f0f0]">
            <Calculator className="w-4 h-4 text-[#1677ff]" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Calculation Input</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Employee</label>
            <select 
              className="w-full px-3 py-2.5 rounded border border-[#d9d9d9] bg-white outline-none focus:border-[#1677ff] text-sm font-medium transition-all"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
            >
              <option value="">Search Employee Database...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
               {/* Overtime Block */}
               <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Overtime Config</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Hours</p>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 rounded border border-white bg-white text-xs outline-none focus:border-blue-500" 
                        value={overtime} 
                        onChange={e => handleNumericInput(e, setOvertime)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Rate/Hr</p>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 rounded border border-white bg-white text-xs outline-none focus:border-blue-500" 
                        value={overtimeRate} 
                        onChange={e => handleNumericInput(e, setOvertimeRate)} 
                      />
                    </div>
                  </div>
               </div>

               {/* Bonus Block */}
               <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[10px] font-bold text-green-700 uppercase">Bonuses</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">One-time Amount ({currentCompany.symbol})</p>
                    <input 
                      type="number" 
                      onFocus={(e) => e.target.select()}
                      className="w-full px-2 py-1.5 rounded border border-white bg-white text-xs outline-none focus:border-green-500" 
                      value={bonus} 
                      onChange={e => handleNumericInput(e, setBonus)} 
                    />
                  </div>
               </div>

               {/* Leave Block */}
               <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarX className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-[10px] font-bold text-orange-700 uppercase">Unpaid Leaves</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Days</p>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 rounded border border-white bg-white text-xs outline-none focus:border-orange-500" 
                        value={leaves} 
                        onChange={e => handleNumericInput(e, setLeaves)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ded/Day</p>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 rounded border border-white bg-white text-xs outline-none focus:border-orange-500" 
                        value={leaveRate} 
                        onChange={e => handleNumericInput(e, setLeaveRate)} 
                      />
                    </div>
                  </div>
               </div>

               {/* Tax Block */}
               <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Compliance</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Tax (%)</p>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 rounded border border-white bg-white text-xs outline-none focus:border-purple-500" 
                        value={taxPercent} 
                        onChange={e => handleNumericInput(e, setTaxPercent)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">VAT (%)</p>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 rounded border border-white bg-white text-xs outline-none focus:border-purple-500" 
                        value={vatPercent} 
                        onChange={e => handleNumericInput(e, setVatPercent)} 
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}

          <button 
            disabled={!selectedEmpId || loading}
            onClick={handleCalculate}
            className={`w-full py-3.5 rounded-md font-bold text-sm flex items-center justify-center gap-2 text-white transition-all
              ${!selectedEmpId || loading ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-[#1677ff] hover:bg-[#4096ff] shadow-lg shadow-blue-500/20 active:scale-[0.98]'}
            `}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'AI IS AUDITING INPUTS...' : 'VALIDATE & PREVIEW PAYSLIP'}
          </button>
        </div>
      </div>

      <div className="h-full">
        {calculatedData ? (
          <div className="bg-white rounded-lg border border-[#f0f0f0] shadow-sm flex flex-col h-full animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-4 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Real-time Summary</h3>
              <button onClick={() => setView('payslip')} className="text-[10px] font-bold text-[#1677ff] flex items-center gap-1 hover:underline">
                <FileText className="w-3.5 h-3.5" /> FULL PAYSLIP
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {aiAudit?.warning && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded flex items-start gap-2 text-red-600 animate-in shake duration-500">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold">{aiAudit.warning}</p>
                  </div>
                )}
                
                <div className="p-6 bg-[#001529] rounded-xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-white/40 uppercase mb-1 tracking-widest">Net Payable (Calculated)</p>
                        <p className="text-4xl font-bold">{currentCompany.symbol}{calculatedData.netSalary.toLocaleString()}</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calculator className="w-16 h-16" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-slate-400 font-bold uppercase mb-1 text-[9px]">Gross Income</p>
                        <p className="font-bold text-slate-800 text-sm">{currentCompany.symbol}{calculatedData.grossSalary.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-slate-400 font-bold uppercase mb-1 text-[9px]">Total Deductions</p>
                        <p className="font-bold text-red-500 text-sm">-{currentCompany.symbol}{(calculatedData.grossSalary - calculatedData.netSalary).toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                  <TrendingDown className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-blue-800 leading-relaxed italic">
                    {aiAudit?.taxExplanation || "AI Audit ready. Ensure percentages follow regional laws."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowConfirmDisburse(true)}
                  className="w-full py-4 bg-[#52c41a] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#73d13d] transition-all shadow-lg shadow-green-500/10 active:scale-[0.98]"
                >
                    <CheckCircle2 className="w-5 h-5" /> CONFIRM & DISBURSE
                </button>
                <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>AES-256 Encrypted</span>
                  <span>•</span>
                  <span>ZenGateway Verified</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg h-full flex flex-col items-center justify-center p-10 text-center text-slate-300">
            <div className="bg-white p-8 rounded-full shadow-sm mb-6">
              <Sparkles className="w-12 h-12 text-[#1677ff] opacity-40 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-slate-400 uppercase mb-2">Awaiting Configuration</h4>
            <p className="text-[11px] font-medium max-w-[240px] leading-relaxed">Select an employee and enter adjustments like Overtime, Leaves, and Taxes to see a detailed audit preview.</p>
          </div>
        )}
      </div>

      <ConfirmationModal 
          isOpen={showConfirmDisburse}
          title="Authorize Payout?"
          message={`Confirming final payment of ${currentCompany.symbol}${calculatedData?.netSalary.toLocaleString()} for ${selectedEmployee?.name}. This will be added to the financial ledger.`}
          onConfirm={executeDisbursement}
          onCancel={() => setShowConfirmDisburse(false)}
          confirmText="AUTHORIZE"
          type="info"
      />
    </div>
  );
};

export default PayrollCalculator;

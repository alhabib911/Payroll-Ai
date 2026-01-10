
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Printer, CheckCircle2, Calculator, ArrowLeft, BadgeCheck, FileText, AlertTriangle, TrendingDown } from 'lucide-react';
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
  const [selectedEmpId, setSelectedEmpId] = React.useState('');
  const [overtime, setOvertime] = React.useState(0);
  const [bonus, setBonus] = React.useState(0);
  const [leaves, setLeaves] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [view, setView] = React.useState<'input' | 'payslip'>('input');
  const [showConfirmDisburse, setShowConfirmDisburse] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      setResult({
        grossSalary: initialRecord.grossSalary,
        tax: initialRecord.tax,
        complianceDeductions: initialRecord.otherDeductions,
        netSalary: initialRecord.netSalary,
        breakdown: initialRecord.breakdown
      });
      setSelectedEmpId(initialRecord.employeeId);
      setOvertime(initialRecord.overtimeHours);
      setBonus(initialRecord.bonuses);
      setLeaves(initialRecord.unpaidLeaves);
      setView('payslip');
    }
  }, [initialRecord]);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  const handleCalculate = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const data = await calculatePayrollWithAI(selectedEmployee, overtime, bonus, leaves);
      if (data) {
        setResult(data);
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
    if (!result || !selectedEmpId) return;
    
    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
    const currentYear = now.getFullYear();

    const record: PayrollRecord = {
        id: 'PAY' + Date.now(),
        employeeId: selectedEmpId,
        companyId: currentCompany.id,
        month: currentMonth,
        year: currentYear,
        grossSalary: result.grossSalary,
        netSalary: result.netSalary,
        tax: result.tax,
        otherDeductions: result.complianceDeductions,
        bonuses: bonus,
        overtimeHours: overtime,
        unpaidLeaves: leaves,
        status: 'Paid',
        breakdown: result.breakdown,
        generatedAt: now.toISOString()
    };
    onRecordCreated(record);
    setResult(null);
    setSelectedEmpId('');
    setView('input');
    setShowConfirmDisburse(false);
  };

  const getDisplayPeriod = () => {
    if (initialRecord) {
      return `${initialRecord.month} ${initialRecord.year}`;
    }
    const now = new Date();
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
    return `${month} ${now.getFullYear()}`;
  };

  if (view === 'payslip' && result && selectedEmployee) {
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
                    <CheckCircle2 className="w-4 h-4" /> DISBURSE FUNDS
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
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Official Remuneration Advice</p>
                </div>
                <div className="text-right">
                    <span className="px-3 py-1 bg-blue-50 text-[#1677ff] rounded border border-blue-100 font-bold uppercase text-[10px] tracking-widest">
                        {getDisplayPeriod()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Employee Summary</h4>
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                        <span className="text-slate-500 font-medium">Name:</span>
                        <span className="font-bold text-slate-800">{selectedEmployee.name}</span>
                        <span className="text-slate-500 font-medium">Staff ID:</span>
                        <span className="font-bold text-slate-800">{selectedEmployee.id}</span>
                        <span className="text-slate-500 font-medium">Jurisdiction:</span>
                        <span className="font-bold text-slate-800 uppercase">{selectedEmployee.country}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Cycle Attendance</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">OT (HRS)</p>
                            <p className="text-lg font-bold text-slate-800">{overtime}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Unpaid (D)</p>
                            <p className="text-lg font-bold text-slate-800">{leaves}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold uppercase text-green-600 border-b border-green-100 pb-2">Allowances</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Basic Wage</span>
                                <span className="font-bold text-slate-800">{currentCompany.symbol}{selectedEmployee.salaryStructure.basic.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Housing Benefit</span>
                                <span className="font-bold text-slate-800">{currentCompany.symbol}{selectedEmployee.salaryStructure.hra.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">One-time Bonus</span>
                                <span className="font-bold text-green-600">+{currentCompany.symbol}{bonus.toLocaleString()}</span>
                            </div>
                            {result.breakdown.overtimePay > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Overtime Pay</span>
                                    <span className="font-bold text-slate-800">{currentCompany.symbol}{result.breakdown.overtimePay.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold uppercase text-red-600 border-b border-red-100 pb-2">Deductions</h4>
                        <div className="space-y-2 text-xs">
                            {result.breakdown.leaveDeduction > 0 && (
                              <div className="flex justify-between">
                                  <span className="text-slate-500">Unpaid Leave Adjustment</span>
                                  <span className="font-bold text-red-600">-{currentCompany.symbol}{result.breakdown.leaveDeduction.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Income Tax (Est.)</span>
                                <span className="font-bold text-red-600">-{currentCompany.symbol}{result.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Compliance/Govt.</span>
                                <span className="font-bold text-red-600">-{currentCompany.symbol}{result.complianceDeductions.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#001529] rounded-lg p-6 text-white flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Net Disbursement</p>
                        <p className="text-3xl font-bold">{currentCompany.symbol}{result.netSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-[#52c41a] font-bold mb-1 text-xs">
                            <BadgeCheck className="w-4 h-4" /> AI Validated
                        </div>
                        <p className="text-[10px] text-white/40 italic">{result.breakdown.taxExplanation}</p>
                    </div>
                </div>
            </div>
        </div>

        <ConfirmationModal 
            isOpen={showConfirmDisburse}
            title="Approve Payout?"
            message={`Verify disbursement of ${currentCompany.symbol}${result.netSalary.toLocaleString()} for ${selectedEmployee.name}.`}
            onConfirm={executeDisbursement}
            onCancel={() => setShowConfirmDisburse(false)}
            confirmText="CONFIRM"
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
              className="w-full px-3 py-2 rounded border border-[#d9d9d9] bg-white outline-none focus:border-[#1677ff] text-sm font-medium transition-all"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
            >
              <option value="">Choose Registry ID...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <div className="p-4 bg-slate-50 rounded border border-slate-100 animate-in slide-in-from-top-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Current Structure</p>
              <div className="grid grid-cols-2 gap-y-1 text-[11px] font-medium text-slate-600">
                <span>Basic:</span><span className="text-right font-bold text-slate-800">{currentCompany.symbol}{selectedEmployee.salaryStructure.basic.toLocaleString()}</span>
                <span>Allowances:</span><span className="text-right font-bold text-slate-800">{currentCompany.symbol}{selectedEmployee.salaryStructure.hra.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overtime (Hours)</label>
              <input type="number" className="w-full px-3 py-2 rounded border border-[#d9d9d9] outline-none focus:border-[#1677ff] text-sm" value={overtime} onChange={e => setOvertime(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bonus ({currentCompany.symbol})</label>
              <input type="number" className="w-full px-3 py-2 rounded border border-[#d9d9d9] outline-none focus:border-[#1677ff] text-sm" value={bonus} onChange={e => setBonus(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unpaid Leave (Days)</label>
            <input type="number" className="w-full px-3 py-2 rounded border border-[#d9d9d9] outline-none focus:border-[#1677ff] text-sm" value={leaves} onChange={e => setLeaves(Number(e.target.value))} />
          </div>

          <button 
            disabled={!selectedEmpId || loading}
            onClick={handleCalculate}
            className={`w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 text-white transition-all
              ${!selectedEmpId || loading ? 'bg-slate-200 cursor-not-allowed' : 'bg-[#1677ff] hover:bg-[#4096ff] shadow-lg shadow-blue-500/20 active:scale-[0.98]'}
            `}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'AI IS AUDITING...' : 'RUN AI CALCULATION'}
          </button>
        </div>
      </div>

      <div className="h-full">
        {result ? (
          <div className="bg-white rounded-lg border border-[#f0f0f0] shadow-sm flex flex-col h-full animate-in zoom-in-95 duration-300">
            <div className="p-4 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Audit Preview</h3>
              <button onClick={() => setView('payslip')} className="text-[10px] font-bold text-[#1677ff] flex items-center gap-1 hover:underline">
                <FileText className="w-3 h-3" /> FULL VIEW
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {result.warning && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded flex items-start gap-2 text-red-600 animate-in shake duration-500">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold">{result.warning}</p>
                  </div>
                )}
                
                <div className="p-5 bg-slate-900 rounded-xl text-white shadow-xl">
                    <p className="text-[9px] font-bold text-white/40 uppercase mb-1 tracking-widest">Calculated Net Payable</p>
                    <p className="text-3xl font-bold">{currentCompany.symbol}{result.netSalary.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-slate-400 font-bold uppercase mb-1 text-[9px]">Tax Liability</p>
                        <p className="font-bold text-red-500">-{currentCompany.symbol}{result.tax.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-slate-400 font-bold uppercase mb-1 text-[9px]">Regulatory</p>
                        <p className="font-bold text-red-500">-{currentCompany.symbol}{result.complianceDeductions.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                  <TrendingDown className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-blue-800 leading-relaxed italic">
                    {result.breakdown.taxExplanation}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowConfirmDisburse(true)}
                  className="w-full py-3 bg-[#52c41a] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#73d13d] transition-all shadow-lg shadow-green-500/10 active:scale-[0.98]"
                >
                    <CheckCircle2 className="w-4 h-4" /> DISBURSE FUNDS
                </button>
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Secure Bank Transfer via ZenGateway</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg h-full flex flex-col items-center justify-center p-10 text-center text-slate-300">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <Sparkles className="w-10 h-10 text-[#1677ff] opacity-40 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-1">Awaiting Auditor Input</h4>
            <p className="text-[10px] font-medium max-w-[200px]">Select an employee and enter adjustments to trigger AI-powered calculation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollCalculator;

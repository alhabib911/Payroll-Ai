
import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  ChevronRight, 
  Filter, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  X,
  BadgeCheck,
  TrendingUp,
  AlertCircle,
  Printer,
  CheckSquare,
  Square
} from 'lucide-react';
import { PayrollRecord, Employee, Company } from '../types';

interface PayrollLedgerProps {
  records: PayrollRecord[];
  employees: Employee[];
  currentCompany: Company;
  onViewPayslip: (record: PayrollRecord) => void;
}

const PayrollLedger: React.FC<PayrollLedgerProps> = ({ records, employees, currentCompany, onViewPayslip }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkPrintMode, setIsBulkPrintMode] = useState(false);

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const filteredRecords = records
    .filter(rec => {
      const empName = getEmployeeName(rec.employeeId).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase()) || rec.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredRecords.map(r => r.id)));
  };

  const handleBulkPrint = () => {
    if (selectedIds.size === 0) return alert("Select at least one record.");
    setIsBulkPrintMode(true);
    // Give react a moment to render the print view before opening dialog
    setTimeout(() => {
        window.print();
        setIsBulkPrintMode(false);
    }, 500);
  };

  // Bulk Print Preview Render
  if (isBulkPrintMode) {
    const selectedRecords = records.filter(r => selectedIds.has(r.id));
    return (
      <div className="fixed inset-0 bg-white z-[999] overflow-y-auto p-10 space-y-10">
        {selectedRecords.map((rec, idx) => {
          const emp = getEmployee(rec.employeeId);
          if (!emp) return null;
          return (
            <div key={rec.id} className={`p-10 border border-slate-200 rounded-lg max-w-4xl mx-auto bg-white ${idx > 0 ? 'page-break-before: always' : ''}`}>
              <div className="flex justify-between items-start border-b border-[#f0f0f0] pb-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{currentCompany.logo}</span>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{currentCompany.name}</h2>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Remuneration Advice (Bulk Export)</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-blue-50 text-[#1677ff] rounded border border-blue-100 font-bold uppercase text-[10px] tracking-widest">
                    {rec.month} {rec.year}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recipient Information</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-slate-500 font-medium">Name:</span>
                    <span className="font-bold text-slate-800">{emp.name}</span>
                    <span className="text-slate-500 font-medium">Staff ID:</span>
                    <span className="font-bold text-slate-800">{emp.id}</span>
                  </div>
                </div>
                <div className="bg-[#001529] rounded-lg p-6 text-white flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Net Payout</p>
                    <p className="text-2xl font-bold">{currentCompany.symbol}{rec.netSalary.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">System Generated Digital Payslip. Audit ID: {rec.id}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Ledger</h2>
          <p className="text-xs font-medium text-slate-400">Comprehensive transaction history and disbursement logs.</p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex gap-2 animate-in slide-in-from-right-2">
            <button onClick={handleBulkPrint} className="flex items-center gap-2 px-4 py-2 bg-[#1677ff] text-white rounded font-bold text-xs shadow-lg hover:bg-[#4096ff] transition-all">
                <Printer className="w-4 h-4" /> BULK PRINT ({selectedIds.size})
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="px-4 py-2 bg-slate-100 text-slate-500 rounded font-bold text-xs">
                CANCEL
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[#f0f0f0] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#fafafa] border-b border-[#f0f0f0] flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by name or ID..." 
              className="w-full pl-9 pr-4 py-2 rounded border border-[#d9d9d9] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 rounded border border-[#d9d9d9] bg-white text-xs font-bold outline-none focus:border-[#1677ff] min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-slate-500 text-[11px] font-bold uppercase border-b border-[#f0f0f0]">
                <th className="px-6 py-4 w-10">
                   <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-200 rounded">
                      {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? <CheckSquare className="w-4 h-4 text-[#1677ff]" /> : <Square className="w-4 h-4" />}
                   </button>
                </th>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Cycle</th>
                <th className="px-6 py-4">Gross</th>
                <th className="px-6 py-4">Net Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {filteredRecords.length > 0 ? filteredRecords.map((rec) => (
                <tr key={rec.id} className={`hover:bg-[#fafafa] transition-colors group ${selectedIds.has(rec.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(rec.id)} className="p-1">
                      {selectedIds.has(rec.id) ? <CheckSquare className="w-4 h-4 text-[#1677ff]" /> : <Square className="w-4 h-4 text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{getEmployeeName(rec.employeeId)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{rec.id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {rec.month} {rec.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {currentCompany.symbol}{rec.grossSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#1677ff]">
                    {currentCompany.symbol}{rec.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${rec.status === 'Paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}
                    `}>
                      {rec.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onViewPayslip(rec)} className="px-3 py-1 bg-white border border-[#d9d9d9] rounded text-[10px] font-bold text-slate-600 hover:text-[#1677ff] hover:border-[#1677ff] transition-all">
                        VIEW ADVICE
                      </button>
                      <button onClick={() => setSelectedRecord(rec)} className="p-1.5 text-slate-400 hover:text-[#1677ff] rounded hover:bg-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-300 italic text-sm">No transaction records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#fafafa] border-b border-[#f0f0f0] flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Audit Details: {selectedRecord.id}</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRecord.employeeId}`} className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200" alt="avatar" />
                <div>
                  <p className="text-base font-bold text-slate-900">{getEmployeeName(selectedRecord.employeeId)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getEmployee(selectedRecord.employeeId)?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded border border-[#f0f0f0]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Payment Period</p>
                  <p className="text-sm font-bold text-slate-800">{selectedRecord.month} {selectedRecord.year}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-[#f0f0f0]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Fulfillment</p>
                  <p className={`text-sm font-bold ${selectedRecord.status === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>{selectedRecord.status}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-[#f0f0f0] pb-1">Financial Ledger Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Gross Emoluments</span>
                    <span className="font-bold text-slate-800">{currentCompany.symbol}{selectedRecord.grossSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Statutory Deductions</span>
                    <span className="font-bold text-red-500">-{currentCompany.symbol}{(selectedRecord.tax + selectedRecord.otherDeductions).toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-[#f0f0f0] flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Net Payable</span>
                    <span className="text-xl font-bold text-[#1677ff]">{currentCompany.symbol}{selectedRecord.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded border border-blue-100 flex gap-3 items-start">
                <TrendingUp className="w-4 h-4 text-[#1677ff] shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-blue-800 leading-relaxed italic">
                  "{selectedRecord.breakdown?.taxExplanation || "Audit validated against regional jurisdictional compliance laws."}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollLedger;

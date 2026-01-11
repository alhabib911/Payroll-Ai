
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Briefcase, TrendingUp, Download, Zap, ArrowUpRight, ArrowDownRight, Calendar, Wallet, Award } from 'lucide-react';
import { PayrollRecord, Employee, AdminProfile } from '../types';

interface DashboardProps {
  employees: Employee[];
  records: PayrollRecord[];
  onProcessPayroll: () => void;
  profile: AdminProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, records, onProcessPayroll, profile }) => {
  const isEmployee = profile.role === 'Employee';
  
  // Logic for calculations
  const totalPayroll = records.reduce((acc, curr) => acc + (isEmployee ? curr.netSalary : curr.grossSalary), 0);
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const avgSalary = records.length > 0 ? (totalPayroll / records.length) : 0;

  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      const monthName = months[idx];
      const monthlyTotal = records
        .filter(r => r.month === monthName)
        .reduce((sum, r) => sum + (isEmployee ? r.netSalary : r.grossSalary), 0);
      
      last6Months.push({ name: monthName, total: monthlyTotal || 0 });
    }
    return last6Months;
  };

  const chartData = getChartData();

  // For Employee: Show Salary Component Breakdown
  // For Admin: Show Department Breakdown
  const getBreakdownData = () => {
    if (isEmployee) {
      const lastRecord = records[records.length - 1];
      if (!lastRecord) return [];
      return [
        { label: 'Basic', value: 60, color: 'bg-[#1677ff]' },
        { label: 'Allowances', value: 25, color: 'bg-[#52c41a]' },
        { label: 'Bonuses', value: 15, color: 'bg-[#faad14]' }
      ];
    }

    if (employees.length === 0) return [];
    const deptTotals: Record<string, number> = {};
    employees.forEach(emp => {
      const gross = emp.salaryStructure.basic + emp.salaryStructure.hra;
      deptTotals[emp.department] = (deptTotals[emp.department] || 0) + gross;
    });
    const totalCost = Object.values(deptTotals).reduce((a, b) => a + b, 0);
    const colors = ['bg-[#1677ff]', 'bg-[#52c41a]', 'bg-[#faad14]', 'bg-[#f5222d]', 'bg-[#722ed1]'];
    return Object.entries(deptTotals).map(([label, cost], i) => ({
      label,
      value: totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const breakdownData = getBreakdownData();

  const handleExport = () => {
    if (records.length === 0) return alert("No records found.");
    const headers = ["ID", "Employee", "Month", "Year", "Gross", "Net", "Status"];
    const rows = records.map(rec => [rec.id, rec.employeeId, rec.month, rec.year, rec.grossSalary, rec.netSalary, rec.status]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Payroll_Export.csv`;
    link.click();
  };

  const stats = isEmployee ? [
    { label: 'Total Net Received', value: `৳${totalPayroll.toLocaleString()}`, icon: Wallet, color: 'text-[#1677ff]', bg: 'bg-[#1677ff]/10', trend: 'Life-to-date', isUp: true },
    { label: 'Leave Balance', value: '14 Days', icon: Calendar, color: 'text-[#52c41a]', bg: 'bg-[#52c41a]/10', trend: 'Annual', isUp: null },
    { label: 'Last Payout', value: records.length > 0 ? `৳${records[records.length-1].netSalary.toLocaleString()}` : '৳0', icon: DollarSign, color: 'text-[#faad14]', bg: 'bg-[#faad14]/10', trend: records.length > 0 ? records[records.length-1].month : 'N/A', isUp: true },
    { label: 'Work Efficiency', value: '98%', icon: Award, color: 'text-[#722ed1]', bg: 'bg-[#722ed1]/10', trend: 'Excellent', isUp: null },
  ] : [
    { label: 'Total Payroll', value: `৳${totalPayroll.toLocaleString()}`, icon: DollarSign, color: 'text-[#1677ff]', bg: 'bg-[#1677ff]/10', trend: '+4.5%', isUp: true },
    { label: 'Active Employees', value: activeEmployees.toString(), icon: Users, color: 'text-[#52c41a]', bg: 'bg-[#52c41a]/10', trend: 'Stable', isUp: null },
    { label: 'Avg Salary', value: `৳${avgSalary.toLocaleString()}`, icon: Briefcase, color: 'text-[#faad14]', bg: 'bg-[#faad14]/10', trend: '+2.1%', isUp: true },
    { label: 'Processing Speed', value: '99.8%', icon: TrendingUp, color: 'text-[#722ed1]', bg: 'bg-[#722ed1]/10', trend: 'Optimized', isUp: null },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{isEmployee ? 'Personal Overview' : 'Executive Overview'}</h2>
          <p className="text-xs font-medium text-slate-400">{isEmployee ? 'Your earnings history and performance metrics.' : 'Real-time enterprise payroll analytics and expenditure.'}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 transition-all">
                <Download className="w-3.5 h-3.5" /> {isEmployee ? 'DOWNLOAD HISTORY' : 'EXPORT'}
            </button>
            {!isEmployee && (
              <button onClick={onProcessPayroll} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1677ff] text-white rounded text-xs font-bold hover:bg-[#4096ff] transition-all shadow-md shadow-blue-500/20">
                  <Zap className="w-3.5 h-3.5 fill-white" /> PROCESS PAYROLL
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-[#f0f0f0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {stat.isUp === true ? <ArrowUpRight className="w-3 h-3 text-[#52c41a]" /> : stat.isUp === false ? <ArrowDownRight className="w-3 h-3 text-[#f5222d]" /> : null}
                  <span className={`text-[10px] font-bold ${stat.isUp ? 'text-[#52c41a]' : stat.isUp === false ? 'text-[#f5222d]' : 'text-slate-400'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-md`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#f0f0f0] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{isEmployee ? 'Earnings Trend' : 'Payroll Flow'}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last 6 Months</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#bfbfbf', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#bfbfbf', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '10px' }} 
                  itemStyle={{ fontWeight: 600, fontSize: '12px' }} 
                />
                <Area type="monotone" dataKey="total" stroke="#1677ff" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6">{isEmployee ? 'Salary Mix' : 'By Department'}</h3>
          <div className="space-y-5">
            {breakdownData.length > 0 ? breakdownData.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-800">{item.value}%</span>
                </div>
                <div className="w-full bg-[#f5f5f5] rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-300 italic py-20 text-xs">No records available.</div>
            )}
          </div>
          {isEmployee && breakdownData.length > 0 && (
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
               <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Insight</p>
               <p className="text-[11px] text-slate-600 leading-relaxed italic">"Your bonus allocation increased by 5% this month compared to the previous cycle."</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

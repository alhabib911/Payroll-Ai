
export type Country = 'BD' | 'KSA' | 'UAE' | 'USA';
export type Language = 'en' | 'bn' | 'ar';
export type UserRole = 'Admin' | 'HR' | 'Accountant' | 'Employee';

export interface CustomSalaryItem {
  id: string;
  name: string;
  amount: number;
  type: 'allowance' | 'deduction';
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  transport: number;
  medical: number;
  customItems: CustomSalaryItem[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  email: string;
  salaryStructure: SalaryStructure;
  country: Country;
  joinDate: string;
  companyId: string;
  systemRole: UserRole;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  companyId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  tax: number;
  vat?: number;
  otherDeductions: number;
  bonuses: number;
  overtimeHours: number;
  overtimeRate: number;
  unpaidLeaves: number;
  unpaidLeaveRate: number;
  taxPercent: number;
  vatPercent: number;
  status: 'Pending' | 'Paid';
  breakdown: any;
  generatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  paymentStatus?: 'Paid' | 'Unpaid';
  appliedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  currency: string;
  symbol: string;
  defaultCountry: Country;
}

export interface AdminProfile {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isLoggedIn: boolean;
  employeeId?: string;
}

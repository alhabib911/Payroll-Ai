
import { Employee, Company, PayrollRecord, AdminProfile, LeaveRequest } from './types';
import { INITIAL_EMPLOYEES, COMPANIES, DEPARTMENTS } from './constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Companies
  getCompanies: async (): Promise<Company[]> => {
    await delay(200);
    const stored = localStorage.getItem('zp_companies');
    return stored ? JSON.parse(stored) : COMPANIES;
  },

  addCompany: async (company: Company): Promise<Company[]> => {
    await delay(400);
    const stored = localStorage.getItem('zp_companies');
    const all = stored ? JSON.parse(stored) : COMPANIES;
    const updated = [...all, company];
    localStorage.setItem('zp_companies', JSON.stringify(updated));
    return updated;
  },

  deleteCompany: async (id: string): Promise<Company[]> => {
    await delay(400);
    const stored = localStorage.getItem('zp_companies');
    const all: Company[] = stored ? JSON.parse(stored) : COMPANIES;
    const updated = all.filter(c => c.id !== id);
    localStorage.setItem('zp_companies', JSON.stringify(updated));
    return updated;
  },

  // Departments
  getDepartments: async (): Promise<string[]> => {
    await delay(100);
    const stored = localStorage.getItem('zp_departments');
    return stored ? JSON.parse(stored) : DEPARTMENTS;
  },

  addDepartment: async (dept: string): Promise<string[]> => {
    await delay(200);
    const stored = localStorage.getItem('zp_departments');
    const all = stored ? JSON.parse(stored) : DEPARTMENTS;
    if (all.includes(dept)) return all;
    const updated = [...all, dept];
    localStorage.setItem('zp_departments', JSON.stringify(updated));
    return updated;
  },

  deleteDepartment: async (dept: string): Promise<string[]> => {
    await delay(200);
    const stored = localStorage.getItem('zp_departments');
    const all: string[] = stored ? JSON.parse(stored) : DEPARTMENTS;
    const updated = all.filter(d => d !== dept);
    localStorage.setItem('zp_departments', JSON.stringify(updated));
    return updated;
  },

  // Employees
  getEmployees: async (companyId: string): Promise<Employee[]> => {
    await delay(300);
    const stored = localStorage.getItem('zp_employees');
    const allEmployees: Employee[] = stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    return allEmployees.filter(emp => emp.companyId === companyId);
  },

  addEmployee: async (employee: Employee): Promise<Employee> => {
    await delay(400);
    const stored = localStorage.getItem('zp_employees');
    const all: Employee[] = stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    const updated = [...all, employee];
    localStorage.setItem('zp_employees', JSON.stringify(updated));
    return employee;
  },

  updateEmployee: async (employee: Employee): Promise<Employee> => {
    await delay(400);
    const stored = localStorage.getItem('zp_employees');
    const all: Employee[] = stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    const updated = all.map(emp => emp.id === employee.id ? employee : emp);
    localStorage.setItem('zp_employees', JSON.stringify(updated));
    return employee;
  },

  // Payroll
  getPayrollRecords: async (companyId: string): Promise<PayrollRecord[]> => {
    await delay(200);
    const stored = localStorage.getItem('zp_payroll');
    const all: PayrollRecord[] = stored ? JSON.parse(stored) : [];
    return all.filter(rec => rec.companyId === companyId);
  },

  savePayrollRecord: async (record: PayrollRecord): Promise<PayrollRecord> => {
    await delay(400);
    const stored = localStorage.getItem('zp_payroll');
    const all: PayrollRecord[] = stored ? JSON.parse(stored) : [];
    const updated = [...all, record];
    localStorage.setItem('zp_payroll', JSON.stringify(updated));
    return record;
  },

  // Leave Management
  getLeaveRequests: async (employeeId: string): Promise<LeaveRequest[]> => {
    await delay(200);
    const stored = localStorage.getItem('zp_leaves');
    const all: LeaveRequest[] = stored ? JSON.parse(stored) : [];
    return all.filter(l => l.employeeId === employeeId);
  },

  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    await delay(300);
    const stored = localStorage.getItem('zp_leaves');
    return stored ? JSON.parse(stored) : [];
  },

  addLeaveRequest: async (req: LeaveRequest): Promise<LeaveRequest> => {
    await delay(400);
    const stored = localStorage.getItem('zp_leaves');
    const all: LeaveRequest[] = stored ? JSON.parse(stored) : [];
    const updated = [...all, req];
    localStorage.setItem('zp_leaves', JSON.stringify(updated));
    return req;
  },

  updateLeaveRequest: async (req: LeaveRequest): Promise<LeaveRequest> => {
    await delay(300);
    const stored = localStorage.getItem('zp_leaves');
    const all: LeaveRequest[] = stored ? JSON.parse(stored) : [];
    const updated = all.map(l => l.id === req.id ? req : l);
    localStorage.setItem('zp_leaves', JSON.stringify(updated));
    return req;
  }
};


import { Country, Company, Employee } from './types';

export const COUNTRIES: Record<Country, { name: string; currency: string; symbol: string }> = {
  BD: { name: 'Bangladesh', currency: 'BDT', symbol: '৳' },
  KSA: { name: 'Saudi Arabia', currency: 'SAR', symbol: '﷼' },
  UAE: { name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
  USA: { name: 'United States', currency: 'USD', symbol: '$' }
};

export const COMPANIES: Company[] = [
  { id: 'C001', name: 'TechFlow Solutions', logo: '🚀', currency: 'BDT', symbol: '৳', defaultCountry: 'BD' },
  { id: 'C002', name: 'Desert Oasis Ltd', logo: '🌴', currency: 'SAR', symbol: '﷼', defaultCountry: 'KSA' }
];

export const DEPARTMENTS = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations'];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'Arif Rahman',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'Active',
    email: 'arif@techflow.com',
    country: 'BD',
    joinDate: '2023-01-15',
    companyId: 'C001',
    salaryStructure: {
      basic: 60000,
      hra: 25000,
      transport: 5000,
      medical: 5000,
      customItems: [
        { id: '1', name: 'Performance Bonus', amount: 5000, type: 'allowance' },
        { id: '2', name: 'Health Insurance', amount: 2000, type: 'deduction' }
      ]
    }
  },
  {
    id: 'EMP002',
    name: 'Ahmed Al-Farsi',
    role: 'Operations Lead',
    department: 'Operations',
    status: 'Active',
    email: 'ahmed@oasis.com',
    country: 'KSA',
    joinDate: '2022-11-20',
    companyId: 'C002',
    salaryStructure: {
      basic: 12000,
      hra: 4000,
      transport: 1000,
      medical: 1000,
      customItems: []
    }
  }
];

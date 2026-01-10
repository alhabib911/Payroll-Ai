
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Country, PayrollRecord } from "../types";

// Helper for payroll calculation using AI
export const calculatePayrollWithAI = async (
  employee: Employee,
  overtimeHours: number,
  bonus: number,
  unpaidLeaveDays: number
) => {
  // Initialize AI client inside the function to pick up updated environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-3-pro-preview for complex reasoning and mathematical payroll logic
  const modelName = 'gemini-3-pro-preview';
  
  const prompt = `
    Calculate payroll for the following employee based on their country's tax laws and the provided inputs.
    Employee: ${JSON.stringify(employee)}
    Overtime Hours: ${overtimeHours}
    Bonus: ${bonus}
    Unpaid Leave Days: ${unpaidLeaveDays}
    
    Country Context: 
    - BD: Bangladesh (Progressive tax slabs, 10-25% typically, standard allowances)
    - KSA: Saudi Arabia (GOSI contribution 10% for locals, fixed rules for expats)
    - UAE: No income tax, pension for nationals only.
    
    Return a detailed breakdown of gross, net, taxes, and specific compliance items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grossSalary: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            complianceDeductions: { type: Type.NUMBER },
            netSalary: { type: Type.NUMBER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                baseTotal: { type: Type.NUMBER },
                overtimePay: { type: Type.NUMBER },
                bonusAmount: { type: Type.NUMBER },
                leaveDeduction: { type: Type.NUMBER },
                taxExplanation: { type: Type.STRING },
                complianceNote: { type: Type.STRING }
              },
              required: ["baseTotal", "overtimePay", "taxExplanation"]
            }
          },
          required: ["grossSalary", "tax", "netSalary", "breakdown"]
        }
      }
    });

    // Directly access .text property from GenerateContentResponse
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("AI Calculation Error:", error);
    return null;
  }
};

// Helper for generating high-level business insights
export const getPayrollInsights = async (records: PayrollRecord[], employees: Employee[]) => {
  // Initialize AI client locally
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Use gemini-3-flash-preview for general summarization tasks
  const modelName = 'gemini-3-flash-preview';
  
  const dataSummary = {
    totalEmployees: employees.length,
    totalMonthlyCost: records.reduce((acc, curr) => acc + curr.grossSalary, 0),
    departmentCost: employees.reduce((acc: any, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + (emp.salaryStructure.basic * 1.5); // Estimate
        return acc;
    }, {})
  };

  const prompt = `
    Analyze the following payroll data summary and provide 3-4 actionable financial insights for a business owner.
    Data: ${JSON.stringify(dataSummary)}
    
    Focus on:
    1. Cost saving opportunities.
    2. Budget anomalies.
    3. Compliance risks.
    Return as a JSON array of objects with 'type' (saving/warning/info), 'message', and 'action'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              message: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ["type", "message"]
          }
        }
      }
    });

    // Use .text property to retrieve results
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("AI Insights Error:", error);
    return [];
  }
};

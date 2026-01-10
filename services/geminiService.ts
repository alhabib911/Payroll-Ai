
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Country, PayrollRecord } from "../types";

export const calculatePayrollWithAI = async (
  employee: Employee,
  overtimeHours: number,
  bonus: number,
  unpaidLeaveDays: number
) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("Gemini API Key is missing.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';
    
    // Enhanced system instruction for the model
    const systemInstruction = `
      You are an expert Payroll Auditor specializing in regional tax compliance for Bangladesh (BD), Saudi Arabia (KSA), and UAE.
      Your task is to calculate a precise monthly payroll breakdown.
      Rules:
      - BD: Apply standard income tax slabs if salary exceeds threshold.
      - KSA: Calculate GOSI deductions (9-10% usually). No income tax for citizens, check for expats.
      - UAE: No income tax, but calculate social security if applicable.
      - Calculate "Unpaid Leave Deduction" as (Gross Salary / 30) * unpaidLeaveDays.
      - Calculate "Overtime Pay" as ((Basic / 208) * 1.5) * overtimeHours.
      - Provide a "taxExplanation" field explaining the logic in 1-2 sentences.
      - If inputs seem unrealistic (e.g. overtime > 100 hours), flag it in "warning" field.
    `;

    const prompt = `
      Perform payroll calculation for:
      Employee Data: ${JSON.stringify(employee)}
      Additional Inputs:
      - Overtime: ${overtimeHours} hours
      - One-time Bonus: ${bonus}
      - Unpaid Leaves: ${unpaidLeaveDays} days
      
      Ensure the output is strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grossSalary: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            complianceDeductions: { type: Type.NUMBER },
            netSalary: { type: Type.NUMBER },
            warning: { type: Type.STRING, description: "Any data entry warnings or errors" },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                baseTotal: { type: Type.NUMBER },
                overtimePay: { type: Type.NUMBER },
                leaveDeduction: { type: Type.NUMBER },
                taxExplanation: { type: Type.STRING }
              },
              required: ["baseTotal", "overtimePay", "leaveDeduction", "taxExplanation"]
            }
          },
          required: ["grossSalary", "tax", "netSalary", "breakdown"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

export const getPayrollInsights = async (records: PayrollRecord[], employees: Employee[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';
    
    const prompt = `Provide 3 strategic payroll cost optimization insights for a company with ${employees.length} employees and a total monthly spend of ${records.reduce((acc, curr) => acc + curr.grossSalary, 0)}. Return JSON array of objects with 'type', 'message', and 'action'.`;

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
            required: ["type", "message", "action"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    return [];
  }
};

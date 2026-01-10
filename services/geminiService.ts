
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Country, PayrollRecord } from "../types";

// Helper for payroll calculation using AI
export const calculatePayrollWithAI = async (
  employee: Employee,
  overtimeHours: number,
  bonus: number,
  unpaidLeaveDays: number
) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("Gemini API Key is missing. Current key state:", apiKey);
    alert("System Error: Gemini API_KEY is not configured in Vercel Environment Variables. Please check Settings.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';
    
    const prompt = `
      Calculate payroll for the following employee based on their country's tax laws.
      Employee: ${JSON.stringify(employee)}
      Overtime: ${overtimeHours} hrs
      Bonus: ${bonus}
      Unpaid Leaves: ${unpaidLeaveDays} days
      
      Return JSON with grossSalary, tax, complianceDeductions, netSalary, and breakdown details.
    `;

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
                taxExplanation: { type: Type.STRING }
              },
              required: ["baseTotal", "overtimePay"]
            }
          },
          required: ["grossSalary", "tax", "netSalary", "breakdown"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    alert("AI calculation failed. Please check your internet connection or API limits.");
    return null;
  }
};

export const getPayrollInsights = async (records: PayrollRecord[], employees: Employee[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';
    
    const prompt = `Provide 3 short business insights for a total cost of ${records.reduce((acc, curr) => acc + curr.grossSalary, 0)}. Return JSON array.`;

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
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    return [];
  }
};

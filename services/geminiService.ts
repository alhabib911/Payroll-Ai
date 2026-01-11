
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Country, PayrollRecord } from "../types";

export const calculatePayrollWithAI = async (
  employee: Employee,
  overtimeHours: number,
  overtimeRate: number,
  bonus: number,
  unpaidLeaveDays: number,
  unpaidLeaveRate: number,
  taxPercent: number,
  vatPercent: number
) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("Gemini API Key is missing.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      You are an expert Payroll Auditor. 
      Analyze the provided payroll inputs and confirm if they follow logical financial patterns.
      Provide a breakdown explanation.
      Flag if Tax or VAT percentages seem unusual for the region.
      Ensure response is JSON.
    `;

    const prompt = `
      Audit this Payroll:
      Employee: ${JSON.stringify(employee)}
      Overtime: ${overtimeHours} hrs @ ${overtimeRate}/hr
      Bonus: ${bonus}
      Unpaid Leaves: ${unpaidLeaveDays} days @ ${unpaidLeaveRate}/day deduction
      Tax: ${taxPercent}%
      VAT: ${vatPercent}%
      
      Return a summary explanation and any warnings.
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
            warning: { type: Type.STRING },
            taxExplanation: { type: Type.STRING }
          },
          required: ["taxExplanation"]
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
    
    const prompt = `Provide 3 strategic payroll cost optimization insights. Return JSON array of objects with 'type', 'message', and 'action'.`;

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

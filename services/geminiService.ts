
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, PayrollRecord } from "../types";

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
  // Always obtain the API key exclusively from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing in environment variables.");
    return null;
  }

  try {
    // Correct initialization as per rules
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const modelName = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      You are an expert Corporate Payroll Auditor. 
      Analyze the provided payroll inputs and confirm if they follow logical financial patterns based on the employee's country (${employee.country}).
      Provide a brief breakdown explanation for the tax applied.
      Flag if Tax or VAT percentages seem unusual or non-compliant for the region.
      Ensure response is strictly valid JSON.
    `;

    const prompt = `
      Audit this Payroll Data:
      Employee: ${employee.name} (Role: ${employee.role}, Country: ${employee.country})
      Base Salary Components: ${JSON.stringify(employee.salaryStructure)}
      Current Period Adjustments:
      - Overtime: ${overtimeHours} hours at ${overtimeRate}/hr
      - Bonus: ${bonus}
      - Unpaid Leaves: ${unpaidLeaveDays} days (Deduction: ${unpaidLeaveRate}/day)
      - Tax Applied: ${taxPercent}%
      - VAT Applied: ${vatPercent}%
      
      Return a summary explanation (taxExplanation) and any risk warnings (warning).
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
            warning: { type: Type.STRING, description: "Any financial or compliance risks flagged." },
            taxExplanation: { type: Type.STRING, description: "Logical explanation for the current tax tier." }
          },
          required: ["taxExplanation"]
        }
      }
    });

    // Use .text property directly as per rules
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini AI Audit Error:", error);
    return null;
  }
};

export const getPayrollInsights = async (records: PayrollRecord[], employees: Employee[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const modelName = 'gemini-3-pro-preview'; // Higher reasoning for insights
    
    const prompt = `Analyze these ${records.length} payroll records for ${employees.length} employees. 
    Provide 3 strategic payroll cost optimization insights. 
    Return a JSON array of objects with 'type' (e.g. Saving, Risk, Trend), 'message', and 'action'.`;

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

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Insight Generation Failed:", error);
    return [];
  }
};

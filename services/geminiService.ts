
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "../types";

export const analyzeProcurementNeeds = async (items: InventoryItem[]) => {
  // Initialize GoogleGenAI using the process.env.API_KEY directly as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this inventory data for a clinical laboratory and suggest procurement needs.
        Prioritize items below min stock or nearing expiry.
        Data: ${JSON.stringify(items)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  recommendedQty: { type: Type.NUMBER },
                  urgency: { type: Type.STRING }
                },
                required: ["itemName", "reason", "recommendedQty", "urgency"]
              }
            }
          }
        }
      }
    });
    
    // Use the .text property to extract the generated response
    const text = response.text?.trim();
    return JSON.parse(text || '{"suggestions": []}');
  } catch (error) {
    console.error("Error analyzing procurement:", error);
    return { suggestions: [] };
  }
};

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface AISuggestion {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  action: string;
}

export const getAISuggestions = async (fieldData: any): Promise<AISuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this field data: ${JSON.stringify(fieldData)}, provide 3 proactive agricultural suggestions. 
      Format the response as a JSON array of objects with these keys: title, description, pros (array of strings), cons (array of strings), action.
      Keep descriptions brief.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Suggestions error:", error);
    return [];
  }
};

export const getAIChatResponse = async (message: string, context: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${JSON.stringify(context)}. User message: ${message}`,
      config: {
        systemInstruction: "You are a helpful AI Agronomist for the PaddyConnect app. Provide concise, professional advice about paddy farming, water management, and pest control. Keep responses under 100 words."
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Chat error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

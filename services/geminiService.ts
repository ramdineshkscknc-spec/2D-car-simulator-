
import { GoogleGenAI, Type } from "@google/genai";
import { Mission } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMission = async (playerStats: { avgSpeed: number, crashes: number }): Promise<Mission> => {
  const prompt = `Generate a high-octane driving mission for a 2D top-down simulator.
  Player status: Average speed ${playerStats.avgSpeed.toFixed(1)}, Total crashes ${playerStats.crashes}.
  Make the mission sound exciting and slightly cinematic.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            targetSpeed: { type: Type.NUMBER },
            timeLimit: { type: Type.NUMBER }
          },
          required: ["title", "objective", "difficulty", "targetSpeed", "timeLimit"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
  } catch (error) {
    console.error("Gemini Mission Error:", error);
    // Fallback mission
    return {
      id: 'fallback',
      title: "Neon Streets Dash",
      objective: "Maintain a speed above 5 units for 30 seconds without crashing.",
      difficulty: "Medium",
      targetSpeed: 5,
      timeLimit: 30
    };
  }
};

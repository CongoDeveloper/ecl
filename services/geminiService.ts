
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly without fallbacks as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAttendanceInsights = async (studentName: string, attendanceCount: number, totalDays: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Génère un court message d'encouragement personnalisé pour l'élève ${studentName} qui a été présent ${attendanceCount} jours sur ${totalDays}. Le ton doit être bienveillant et professionnel.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Continuez vos efforts constants pour une excellente année scolaire !";
  }
};

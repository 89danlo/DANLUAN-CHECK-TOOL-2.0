
import { GoogleGenAI } from "@google/genai";

// Función para obtener la instancia de IA usando la variable de entorno obligatoria
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY no detectada. La IA no responderá hasta que se configure en Netlify.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// Usamos estrictamente el motor Flash 3 para mayor velocidad y eficiencia
export const PRIMARY_MODEL = 'gemini-3-flash-preview';

const SYSTEM_PROMPT = `Eres el SOPORTE TÉCNICO de DANLUAN TOOL. Eres experto en el REBT (Reglamento Electrotécnico de Baja Tensión) y en instalaciones eléctricas. 
Ayuda al instalador a diagnosticar averías y resolver dudas técnicas de forma profesional y concisa.`;

export const askGemini = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      },
    });
    
    return {
      text: response.text || "Sin respuesta técnica.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error: any) {
    console.error("Error API Gemini:", error);
    return { 
      text: "❌ ERROR DE CONEXIÓN: La IA no puede responder. Verifica la API_KEY en Netlify.", 
      sources: []
    };
  }
};

export const analyzePanelImage = async (base64Image: string, includeDiagram: boolean = false) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Analiza este cuadro eléctrico buscando riesgos, componentes y cumplimiento normativo.",
          },
        ],
      },
      config: {
        temperature: 0.4,
      },
    });
    
    return response.text || "No se pudo realizar el análisis visual.";
  } catch (error: any) {
    console.error("Error Vision API:", error);
    return "❌ Error al conectar con el motor de visión IA.";
  }
};

export const readInstrumentOCR = async (base64Image: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Extrae SOLO el número principal de la pantalla digital. Sin unidades ni letras.",
          },
        ],
      },
      config: {
        temperature: 0.1,
      },
    });
    
    const text = response.text || "";
    const match = text.match(/[0-9]+([,.][0-9]+)?/);
    return match ? match[0].replace(',', '.') : "";
  } catch (error: any) {
    return "";
  }
};

export const generateBreakdownReport = async (history: {role: string, content: string}[]) => {
  try {
    const ai = getAI();
    const reportPrompt = `Genera un INFORME TÉCNICO basado en esta intervención:
    ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
    
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: reportPrompt,
      config: { temperature: 0.3 }
    });
    return response.text || "Informe no disponible.";
  } catch (error) {
    return "Error al generar el informe técnico.";
  }
};

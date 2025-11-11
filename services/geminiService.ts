
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
        } else {
            resolve("");
        }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzePlant = async (imageFile: File): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: "Identify the plant in this image. Respond with only the common name of the plant, and nothing else." }] },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing plant:", error);
        throw new Error("Could not identify the plant. Please try another image.");
    }
};

export const getCareInstructions = async (plantName: string): Promise<string> => {
    try {
        const prompt = `Provide detailed care instructions for a ${plantName}. For each category, use a heading like '### Topic:'. Include the following categories: Sunlight, Watering, Soil, Temperature, Humidity, and Fertilizing. Provide a brief, one-sentence summary at the very top.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting care instructions:", error);
        throw new Error("Could not retrieve care instructions for this plant.");
    }
};

export const createChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly and knowledgeable gardening assistant named Ivy. Answer questions about gardening, plants, and related topics concisely and helpfully.',
        },
    });
};

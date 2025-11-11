
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { PlantCareGuide, Diagnosis } from "../types";

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

export const analyzePlantName = async (imageFile: File): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: "Identify the plant in this image. Respond with only the common name of the plant, and nothing else." }] },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing plant name:", error);
        throw new Error("Could not identify the plant. Please try another image.");
    }
};

const careInstructionsSchema = {
    type: Type.OBJECT,
    properties: {
        plantName: { type: Type.STRING, description: "The common name of the plant." },
        summary: { type: Type.STRING, description: "A brief, one-sentence summary of the plant's needs." },
        instructions: {
            type: Type.ARRAY,
            description: "An array of care instructions for different topics.",
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "The care topic (e.g., Sunlight, Watering)." },
                    details: { type: Type.STRING, description: "Detailed instructions for this topic." },
                    frequencyDays: {
                        type: Type.OBJECT,
                        nullable: true,
                        description: "The care frequency in days, only for Watering and Fertilizing.",
                        properties: {
                            min: { type: Type.INTEGER, description: "Minimum days between actions." },
                            max: { type: Type.INTEGER, description: "Maximum days between actions." }
                        },
                    }
                },
                 required: ['topic', 'details']
            }
        }
    },
    required: ['plantName', 'summary', 'instructions']
};

export const getCareInstructions = async (plantName: string): Promise<PlantCareGuide> => {
    try {
        const prompt = `Provide a detailed care guide for a ${plantName}. Respond with a JSON object. The guide must include a 'plantName', a brief 'summary', and an array of 'instructions'. The instructions should cover these topics: Sunlight, Watering, Soil, Temperature, Humidity, and Fertilizing. For "Watering" and "Fertilizing", provide an estimated 'frequencyDays' object with min and max days. For other topics, 'frequencyDays' should be null.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: careInstructionsSchema,
            }
        });

        return JSON.parse(response.text) as PlantCareGuide;
    } catch (error) {
        console.error("Error getting care instructions:", error);
        throw new Error("Could not retrieve care instructions for this plant.");
    }
};

const diagnosisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            issue: { type: Type.STRING, description: "Name of the disease or pest." },
            description: { type: Type.STRING, description: "A brief description of the issue." },
            confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "Confidence level of the diagnosis." },
            treatment: {
                type: Type.OBJECT,
                properties: {
                    organic: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of organic treatment steps." },
                    chemical: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of chemical treatment steps." }
                },
                required: ['organic', 'chemical']
            }
        },
        required: ['issue', 'description', 'confidence', 'treatment']
    }
};

export const diagnosePlantProblem = async (imageFile: File): Promise<Diagnosis[]> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const prompt = "Analyze this image of a plant for diseases or pests. Respond with a JSON array of potential issues. For each issue, include its name ('issue'), a 'description', a 'confidence' level ('High', 'Medium', or 'Low'), and 'treatment' options. For treatments, provide separate arrays of strings for 'organic' and 'chemical' methods, with each string being a step-by-step instruction.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: diagnosisSchema,
            }
        });
        return JSON.parse(response.text) as Diagnosis[];
    } catch (error) {
        console.error("Error diagnosing plant problem:", error);
        throw new Error("Could not diagnose the plant problem. The image may be unclear or the issue unrecognizable.");
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

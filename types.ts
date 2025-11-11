
export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}

// New types for structured care instructions
export interface StructuredCareInstruction {
  topic: string;
  details: string;
  frequencyDays?: {
      min: number;
      max: number;
  } | null;
}

export interface PlantCareGuide {
  plantName: string;
  summary: string;
  instructions: StructuredCareInstruction[];
}

// New type for plants saved in "My Garden"
export interface GardenPlant {
  id: number;
  name: string;
  image: string; // base64 data URL
  summary: string;
  careInstructions: StructuredCareInstruction[];
  wateringLog: string[]; // array of ISO date strings
  fertilizingLog: string[]; // array of ISO date strings
  notes: string;
}

// New types for Plant Doctor feature
export interface Treatment {
  organic: string[];
  chemical: string[];
}

export interface Diagnosis {
  issue: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
  treatment: Treatment;
}

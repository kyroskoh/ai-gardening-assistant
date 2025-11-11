
export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}

export interface CareInstruction {
  topic: string;
  details: string;
}

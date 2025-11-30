import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let chatSession: Chat | null = null;

// Initialize the API client
// Note: In a real production app, this should be proxied through a backend to hide the key,
// or use the user's key if allowed. For this demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const initChat = () => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const session = initChat();
    const result: GenerateContentResponse = await session.sendMessage({ message });
    return result.text || "I'm having trouble connecting to the network right now. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection interrupted. Please ensure your API key is valid.";
  }
};

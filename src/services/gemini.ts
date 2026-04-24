import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type EmojifyMode = 'literal' | 'story' | 'vibes';

export async function emojifyText(text: string, mode: EmojifyMode): Promise<string> {
  if (!text.trim()) return "";

  const systemInstructions = {
    literal: "You are an emoji translator. Replace as many words as possible with individual emojis while keeping the sentence structure understandable. Mix emojis and text if needed, but maximize emojis.",
    story: "You are an emoji storyteller. Translate the entire input into a sequence of emojis only. Do not use any text in the output. Focus on capturing the concepts, actions, and sequence.",
    vibes: "You are an emoji vibe master. Read the text and provide a cluster of 5-10 emojis that perfectly capture the mood, themes, and 'vibe' of the text. Do not include the original text."
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: systemInstructions[mode],
        temperature: 0.8,
      },
    });

    return response.text || "✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to emojify. Check your connection or API key.");
  }
}

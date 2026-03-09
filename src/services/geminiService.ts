import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export async function generateQuiz(
  topic: string,
  level: string = "A1",
): Promise<QuizQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 5-question multiple-choice quiz for a Mandarin Chinese speaker learning French.
      Topic: ${topic}
      CEFR Level: ${level}
      
      The questions should be in Chinese, asking for the French translation, or vice versa.
      Provide 4 options for each question.
      Include a brief explanation in Chinese for why the answer is correct.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The quiz question in Chinese or French.",
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "4 possible answers.",
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description:
                  "The index (0-3) of the correct answer in the options array.",
              },
              explanation: {
                type: Type.STRING,
                description:
                  "A brief explanation in Chinese of the correct answer.",
              },
            },
            required: [
              "question",
              "options",
              "correctAnswerIndex",
              "explanation",
            ],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}

export async function explainGrammar(concept: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain the French grammar concept "${concept}" to a Mandarin Chinese speaker.
      Keep it concise, encouraging, and easy to understand. Provide 2-3 examples with Chinese translations.
      Format the response in Markdown.`,
    });
    return response.text || "抱歉，无法生成解释。";
  } catch (error) {
    console.error("Error explaining grammar:", error);
    return "抱歉，发生错误。";
  }
}

export async function generateNextLesson(
  completedTopics: string[],
  currentLevel: number,
): Promise<{
  title: string;
  description: string;
  topic: string;
  type: "vocabulary" | "grammar";
  level: string;
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a new French learning lesson for a Mandarin Chinese speaker.
      They are currently at Level ${currentLevel}.
      They have already learned these topics: ${completedTopics.join(", ")}.
      Suggest a new, slightly more advanced topic (either vocabulary or grammar).
      Provide the title in Chinese and French (e.g., "家庭成员 (La Famille)").
      Provide a short description in Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            topic: {
              type: Type.STRING,
              description:
                "The core topic in English, e.g., 'Family vocabulary' or 'Passé composé'",
            },
            type: {
              type: Type.STRING,
              description: "Must be 'vocabulary' or 'grammar'",
            },
            level: {
              type: Type.STRING,
              description: "CEFR level, e.g., 'A1', 'A2'",
            },
          },
          required: ["title", "description", "topic", "type", "level"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    const parsed = JSON.parse(text);

    // Ensure type is strictly one of the allowed literals
    if (parsed.type !== "vocabulary" && parsed.type !== "grammar") {
      parsed.type = "vocabulary";
    }

    return parsed;
  } catch (error) {
    console.error("Error generating next lesson:", error);
    throw error;
  }
}

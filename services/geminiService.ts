
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const extractInfoFromReceipt = async (imageBase64: string, mimeType: string): Promise<OCRResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: imageBase64,
                        },
                    },
                    {
                        text: "Analyze this receipt image. Extract the total amount (as a number) and a brief description of the items purchased (as a string). Respond ONLY with a JSON object with 'amount' and 'content' keys. If you cannot determine a value, omit the key. Example: {\"amount\": 150000, \"content\": \"Coffee and pastries\"}",
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: { type: Type.NUMBER },
                        content: { type: Type.STRING },
                    },
                },
            },
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result as OCRResult;

    } catch (error) {
        console.error("Error extracting info from receipt:", error);
        return null;
    }
};

const API_URL = "https://fastapi-app-l7sj.onrender.com/predict";

export interface EmotionResult {
    emotion: string;
    confidence: number;
}

export async function predictEmotion(text: string): Promise<EmotionResult> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}
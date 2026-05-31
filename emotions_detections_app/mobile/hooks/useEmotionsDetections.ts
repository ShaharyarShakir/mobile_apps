import { useState } from "react";
import { predictEmotion, type EmotionResult } from "../services/emotionApi";

interface UseEmotionDetectorReturn {
    text: string;
    setText: (text: string) => void;
    result: EmotionResult | null;
    loading: boolean;
    error: string | null;
    analyze: () => Promise<void>;
    reset: () => void;
}

export function useEmotionDetector(): UseEmotionDetectorReturn {
    const [text, setText] = useState("");
    const [result, setResult] = useState<EmotionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await predictEmotion(text);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setText("");
        setResult(null);
        setError(null);
    };

    return { text, setText, result, loading, error, analyze, reset };
}
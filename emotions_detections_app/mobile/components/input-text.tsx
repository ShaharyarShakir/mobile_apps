import React from "react";
import { useEmotionDetector } from "@/hooks/useEmotionsDetections";
import { View, Text } from "react-native";
import { TextInputField } from "./text-input-field";
import { AnalyzeButton } from "./analyze-button";
import { ErrorMessage } from "./error-message";
import { EmotionResultCard } from "./emotion-result-card";


export default function InputField() {
    const { text, setText, result, loading, error, analyze, reset } = useEmotionDetector();

    return (
        <View className="flex-1 items-center justify-center bg-white px-5">
            <Text className="text-2xl font-bold mb-5">Emotion Detector</Text>

            <TextInputField
                value={text}
                onChange={setText}
                onClear={reset}
                placeholder="Type your text..."
            />

            <AnalyzeButton
                onPress={analyze}
                loading={loading}
                disabled={!text.trim()}
            />

            {error && <ErrorMessage message={error} />}

            {result && <EmotionResultCard result={result} />}
        </View>
    );
}
import React from "react";
import { EmotionResult } from "@/services/emotionApi";
import { View, Text } from "react-native";


interface EmotionResultCardProps {
    result: EmotionResult;
}

export function EmotionResultCard({ result }: EmotionResultCardProps) {
    return (
        <View className="mt-6 items-center bg-gray-50 rounded-2xl px-8 py-5 w-full">
            <Text className="text-sm text-gray-400 uppercase tracking-widest mb-1">
                Detected Emotion
            </Text>
            <Text className="text-3xl font-bold capitalize mb-2">{result.emotion}</Text>
            <ConfidenceBar confidence={result.confidence} />
            <Text className="text-sm text-gray-500 mt-1">{result.confidence}% confidence</Text>
        </View>
    );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
    return (
        <View className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <View
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${confidence}%` }}
            />
        </View>
    );
}
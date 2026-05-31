import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface AnalyzeButtonProps {
    onPress: () => void;
    loading: boolean;
    disabled?: boolean;
}

export function AnalyzeButton({ onPress, loading, disabled }: AnalyzeButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`px-6 py-3 rounded-xl ${disabled || loading ? "bg-blue-300" : "bg-blue-500"}`}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text className="text-white font-semibold">Analyze</Text>
            )}
        </TouchableOpacity>
    );
}
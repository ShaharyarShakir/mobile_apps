import React from "react";
import { View, Text } from "react-native";

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <View className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 w-full">
            <Text className="text-red-600 text-sm">{message}</Text>
        </View>
    );
}
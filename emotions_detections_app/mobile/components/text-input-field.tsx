import React from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";

interface TextInputFieldProps {
    value: string;
    onChange: (text: string) => void;
    onClear?: () => void;
    placeholder?: string;
}

export function TextInputField({
    value = "",
    onChange,
    onClear,
    placeholder = "Type your text...",
}: TextInputFieldProps) {
    return (
        <View className="w-full mb-4">
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                multiline
                numberOfLines={4}
                className="w-full border border-gray-300 rounded-xl p-3 text-base"
                textAlignVertical="top"
            />
            {value.length > 0 && onClear && (
                <TouchableOpacity
                    onPress={onClear}
                    className="absolute top-2 right-3"
                >
                    <Text className="text-gray-400 text-lg">✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
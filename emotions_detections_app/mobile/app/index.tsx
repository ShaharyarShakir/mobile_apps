import { TextInputField } from "@/components/text-input-field";
import { predictEmotion, EmotionResult } from "@/services/emotionApi";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      const data = await predictEmotion(text);
      setResult(data);
      setText("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View className="flex-1 p-4 justify-center">
      <TextInputField
        value={text}
        onChange={setText}
        onClear={() => setText("")}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={text.length === 0}
        className="bg-blue-500 rounded-xl p-3 items-center disabled:opacity-50"
      >
        <Text className="text-white font-semibold text-base">Submit</Text>
      </TouchableOpacity>
      {result && (
        <View className="mt-4">
          <Text className="text-lg font-semibold">Emotion: {result.emotion}</Text>
          <Text className="text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
        </View>
      )}
      {error && <Text className="mt-4 text-red-500">{error}</Text>}
    </View>
  );
}
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface PasswordFieldProps {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onBlur?: () => void;
}

export function PasswordField({
  label = 'Password',
  error,
  value,
  onChangeText,
  placeholder = '••••••••',
  onBlur,
}: PasswordFieldProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  return (
    <View className="w-full mb-4">
      {label ? (
        <Text className="text-slate-400 text-sm font-semibold mb-1.5 uppercase tracking-wider">
          {label}
        </Text>
      ) : null}
      <View className="relative w-full">
        <TextInput
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          className={`w-full pl-4 pr-14 py-3.5 bg-slate-900 border text-slate-100 rounded-xl text-base ${
            error ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
          }`}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSecureTextEntry(!secureTextEntry)}
          className="absolute right-0 top-0 bottom-0 px-4 justify-center items-center"
        >
          <Text className="text-indigo-500 text-xs font-extrabold uppercase tracking-wide">
            {secureTextEntry ? 'Show' : 'Hide'}
          </Text>
        </TouchableOpacity>
      </View>
      {error ? <Text className="text-rose-500 text-xs font-semibold mt-1">{error}</Text> : null}
    </View>
  );
}

export default PasswordField;

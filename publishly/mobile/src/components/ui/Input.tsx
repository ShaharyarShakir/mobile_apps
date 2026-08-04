import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <View className={`w-full mb-4 ${className}`}>
        {label ? (
          <Text className="text-slate-400 text-sm font-semibold mb-1.5 uppercase tracking-wider">
            {label}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#64748b"
          className={`w-full px-4 py-3.5 bg-slate-900 border text-slate-100 rounded-xl text-base ${
            error ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
          }`}
          {...props}
        />
        {error ? <Text className="text-rose-500 text-xs font-semibold mt-1">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;

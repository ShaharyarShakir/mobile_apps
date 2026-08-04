import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, GestureResponderEvent } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  let btnStyle = 'bg-indigo-600 border-indigo-600';
  let textStyle = 'text-white font-bold';

  if (variant === 'secondary') {
    btnStyle = 'bg-slate-800 border-slate-800';
    textStyle = 'text-white font-semibold';
  } else if (variant === 'outline') {
    btnStyle = 'bg-transparent border-slate-700 border';
    textStyle = 'text-slate-200 font-semibold';
  } else if (variant === 'danger') {
    btnStyle = 'bg-rose-600 border-rose-600';
    textStyle = 'text-white font-bold';
  }

  const isBtnDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isBtnDisabled}
      className={`w-full py-4 rounded-xl flex-row justify-center items-center ${btnStyle} ${
        isBtnDisabled ? 'opacity-50' : 'active:opacity-90'
      } ${className}`}
    >
      {isLoading ? <ActivityIndicator size="small" color="#ffffff" className="mr-2" /> : null}
      <Text className={`text-base tracking-wide ${textStyle}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export default Button;

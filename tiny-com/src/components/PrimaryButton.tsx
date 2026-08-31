import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

interface PrimaryButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export function PrimaryButton({
  title,
  loading = false,
  disabled,
  className = "",
  textClassName = "",
  style,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={(state) => [
        {
          transform: [{ scale: state.pressed && !isDisabled ? 0.97 : 1 }],
        },
        typeof style === "function" ? style(state) : style,
      ]}
      className={`rounded-2xl bg-black px-6 py-4 ${
        isDisabled ? "opacity-50" : "active:opacity-90"
      } ${className}`}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          className={`text-center text-base font-semibold text-white ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

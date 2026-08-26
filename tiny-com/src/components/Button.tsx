import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        pressed && isInteractive && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#FFFFFF" : "#18181B"}
        />
      ) : (
        <Text
          style={[
            styles.baseText,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && styles.secondaryText,
            variant === "ghost" && styles.ghostText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#18181B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  secondary: {
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  baseText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  primaryText: {
    color: "#FAFAFA",
  },
  secondaryText: {
    color: "#18181B",
  },
  ghostText: {
    color: "#71717A",
  },
  disabledText: {
    color: "#A1A1AA",
  },
});


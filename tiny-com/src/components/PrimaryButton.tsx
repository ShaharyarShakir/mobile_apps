import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    GestureResponderEvent,
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { triggerHaptic } from "../lib/haptics";
import { useTheme } from "../theme/ThemeContext";

interface PrimaryButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "accent" | "secondary" | "danger" | "outline";
  iconName?: keyof typeof Ionicons.glyphMap;
  textStyle?: object;
}

export function PrimaryButton({
  title,
  loading = false,
  disabled,
  variant = "primary",
  iconName,
  style,
  textStyle,
  onPress,
  ...props
}: PrimaryButtonProps) {
  const { colors, isDark } = useTheme();
  const isDisabled = disabled || loading;

  const handlePress = (e: GestureResponderEvent) => {
    if (isDisabled) return;
    triggerHaptic("light");
    onPress?.(e);
  };

  const getBackgroundColor = (pressed: boolean) => {
    if (variant === "accent") {
      return pressed ? colors.accentHover || colors.accentGradientEnd : colors.accent;
    }
    if (variant === "secondary") {
      return pressed ? colors.surfaceElevated : colors.surfaceSubtle;
    }
    if (variant === "outline") {
      return pressed ? colors.surfaceSubtle : "transparent";
    }
    if (variant === "danger") {
      return pressed ? "#B91C1C" : colors.danger;
    }
    // Default primary
    return pressed
      ? isDark
        ? "#E2E8F0"
        : "#1E293B"
      : colors.primaryButtonBg;
  };

  const getTextColor = () => {
    if (variant === "accent" || variant === "danger") {
      return "#FFFFFF";
    }
    if (variant === "secondary" || variant === "outline") {
      return colors.textPrimary;
    }
    return colors.primaryButtonText;
  };

  const getBorderColor = () => {
    if (variant === "secondary" || variant === "outline") {
      return colors.border;
    }
    return "transparent";
  };

  return (
    <Pressable
      onPress={handlePress}
      style={(state) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(state.pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === "secondary" || variant === "outline" ? 1 : 0,
          opacity: isDisabled ? 0.45 : 1,
          transform: [{ scale: state.pressed && !isDisabled ? 0.985 : 1 }],
        },
        typeof style === "function" ? style(state) : style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});

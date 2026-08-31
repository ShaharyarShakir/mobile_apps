import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface SuccessCheckmarkProps {
  size?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
  color?: string;
  bgColor?: string;
}

export function SuccessCheckmark({
  size = 52,
  iconName = "checkmark-sharp",
  color = "#FFFFFF",
  bgColor,
}: SuccessCheckmarkProps) {
  const { colors } = useTheme();
  const background = bgColor || colors.success;

  return (
    <View
      style={[
        styles.outerRing,
        {
          width: size + 10,
          height: size + 10,
          borderRadius: (size + 10) / 2,
          backgroundColor: colors.successSubtle,
        },
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons name={iconName} size={size * 0.55} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});

import { StyleSheet, Text, View } from "react-native";

type LogoProps = {
  size?: number;
};

export function Logo({ size = 72 }: LogoProps) {
  const innerSize = size * 0.55;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <View
        style={[
          styles.outerFrame,
          {
            width: size * 0.76,
            height: size * 0.76,
            borderRadius: size * 0.2,
          },
        ]}
      >
        <View
          style={[
            styles.innerBox,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize * 0.24,
            },
          ]}
        >
          <View style={styles.compressionArrow}>
            <Text style={[styles.symbolText, { fontSize: size * 0.24 }]}>⇣</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#18181B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  outerFrame: {
    borderWidth: 1.5,
    borderColor: "#3F3F46",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  innerBox: {
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
  },
  compressionArrow: {
    alignItems: "center",
    justifyContent: "center",
  },
  symbolText: {
    color: "#FAFAFA",
    fontWeight: "700",
    lineHeight: undefined,
  },
});


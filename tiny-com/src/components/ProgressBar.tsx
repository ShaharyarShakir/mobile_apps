import { View } from "react-native";

type ProgressBarProps = {
  progress: number; // 0 to 100
  className?: string;
};

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View
      className={`h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 ${className}`}
    >
      <View
        className="h-full rounded-full bg-black"
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
}


import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type EmptyUIProps = {
  title: string;
  subtitle?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  iconSize?: number;
  buttonLabel?: string;
  onPressButton?: () => void;
};

function EmptyUI({
  title,
  subtitle,
  iconName = 'chatbubbles-outline',
  iconColor = '#6B6B70',
  iconSize = 64,
  buttonLabel,
  onPressButton,
}: EmptyUIProps) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      {iconName && <Ionicons name={iconName} size={iconSize} color={iconColor} />}
      <Text className="mt-4 text-lg text-muted-foreground">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-subtle-foreground">{subtitle}</Text> : null}
      {buttonLabel && onPressButton ? (
        <Pressable className="mt-6 rounded-full bg-primary px-6 py-3" onPress={onPressButton}>
          <Text className="font-semibold text-surface-dark">{buttonLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default EmptyUI;

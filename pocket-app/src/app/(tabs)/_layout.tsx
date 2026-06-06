import { COLORS } from "@/utils/Colors";
import { Icon } from "expo-router";
import { NativeTabs } from "expo-router/build/native-tabs";

export default function RootLayout() {
  return <NativeTabs blurEffect="systemChromeMaterial" tintColor={COLORS.textLight}>
    <NativeTabs.Trigger name="home">
      <Icon
        sf={{ default: 'house', selected: 'house.fill' }}
        md={{ default: 'home', selected: 'home_filled' }}
      />
    </NativeTabs.Trigger>
    <NativeTabs.Trigger name="saves">
      <Icon
        sf={{ default: 'heart', selected: 'heart.fill' }}
        md={{ default: 'heart_smile', selected: 'heart_check' }}
      />
    </NativeTabs.Trigger>
    <NativeTabs.Trigger name="settings">
      <Icon
        sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
        md={{ default: 'settings', selected: 'settings' }}
      />
    </NativeTabs.Trigger>
  </NativeTabs>
}

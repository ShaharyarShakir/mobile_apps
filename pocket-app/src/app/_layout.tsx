import { Icon } from "expo-router";
import { NativeTabs } from "expo-router/build/native-tabs";

export default function RootLayout() {
  return <NativeTabs>
    <NativeTabs.Trigger name="home">
      <Icon
        sf={{ default: 'house', selected: 'house.fill' }}
        md={{ default: 'home', selected: 'home_filled' }}
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

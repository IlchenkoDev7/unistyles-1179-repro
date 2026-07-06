import { Tabs } from 'expo-router';

// The nested Tabs navigator. When the user pushes settings + edit-profile over
// it, this whole navigator (with all four blurred tab screens) is frozen two
// levels below the top, then unmounted wholesale on logout.
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
    </Tabs>
  );
}

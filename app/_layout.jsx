import '../global.css';
import { Stack } from 'expo-router';
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'splashscreen',
};

function RootLayout() {
  return (
    <Stack initialRouteName='splashscreen'>
      <Stack.Screen name="splashscreen"  options={{ headerShown: false }}  />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Ajoutez un displayName pour aider au débogage
RootLayout.displayName = 'RootLayout';

export default RootLayout;
import React from "react";
import { View, Text } from "react-native";

import { Stack, useRouter } from "expo-router";
import { UserProvider } from "../context/UserContext";
export default function RootLayout() {
  return (
    <UserProvider>
      <View style={{ flex: 1 }}>
        <Stack  >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </UserProvider>
  );
}

import React from "react";
import { View, Text } from "react-native";

import { Stack, useRouter } from "expo-router";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

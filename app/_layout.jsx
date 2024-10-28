import React, { useEffect, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Stack, useRouter } from 'expo-router';



export default function RootLayout() {
  

  return (
    <View style={{ flex: 1 }}>
      <Stack>  
        <Stack.Screen name="splashscreen" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

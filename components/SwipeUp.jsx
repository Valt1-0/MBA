import React from "react";
import { View, Text, Dimensions } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const { height } = Dimensions.get("window");

const DraggablePanel = () => {
  const translateY = useSharedValue(height); // Le panneau commence en bas de l'écran

  // Définir le geste de drag vertical
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Ajuster la position Y en fonction du drag
      translateY.value = Math.max(height * 0.5, translateY.value + event.translationY);
    })
    .onEnd(() => {
      // Déterminer la position finale : moitié de l'écran ou tout en bas
      if (translateY.value > height * 0.75) {
        translateY.value = withTiming(height); // Revenir complètement en bas
      } else {
        translateY.value = withTiming(height * 0.5); // Revenir à 50% de la hauteur
      }
    });

  // Appliquer le style animé pour le déplacement vertical du panneau
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-bold">Contenu principal</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            animatedStyle,
            {
              height: height,
              width: "100%",
              position: "absolute",
              bottom: 0,
              backgroundColor: "white",
            },
          ]}
          className="rounded-t-2xl p-5 shadow-lg"
        >
          <View className="h-1 w-12 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-lg font-bold text-center">Détails</Text>
          <Text className="text-gray-500 text-center">Contenu du panneau glissant</Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default DraggablePanel;
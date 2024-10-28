import React from "react";
import { View, Text, Dimensions } from "react-native";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";


const DraggablePanel = () => {
     const frame = useSafeAreaFrame();
       const insets = useSafeAreaInsets();
 

     const height  = frame.height - (insets.bottom + insets.top);
  const translateY = useSharedValue(height); // Le panneau commence en bas de l'écran

  // Définir le geste de drag vertical
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Déplacer le panneau selon la position du drag
      translateY.value = Math.max(
        height * 0.5,
        Math.min(height, translateY.value + event.translationY)
      );
    })
    .onEnd(() => {
      // Régle la position finale du panneau
      translateY.value =
        translateY.value > height * 0.75
          ? withTiming(height)
          : withTiming(height * 0.5);
    });

  // Style animé pour le panneau
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Contenu principal
        </Text>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          collapsable={false}
          style={[
            animatedStyle,
            {
              height: height,
              width: "100%",
              position: "absolute",
              bottom: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
          ]}
        >
          <View
            style={{
              height: 5,
              width: 60,
              backgroundColor: "#ccc",
              borderRadius: 5,
              alignSelf: "center",
              marginBottom: 10,
            }}
          />
          <Text style={{ fontSize: 24, textAlign: "center" }}>Détails</Text>
          <Text style={{ color: "gray", textAlign: "center" }}>
            Contenu du panneau glissant
          </Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default DraggablePanel;

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
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const DraggablePanel = () => {
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();

  const height = frame.height - (insets.bottom + insets.top);
  const translateY = useSharedValue(height); // Le panneau commence en bas de l'écran

  // Définir le geste de drag vertical
  const gesture = Gesture.Pan().shouldCancelWhenOutside(true)
    .onUpdate((event) => {
      // Ajuster la position Y en fonction du drag
      translateY.value = Math.max(
        height * 0.5,
        translateY.value + event.translationY
      );
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Contenu principal
        </Text>
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
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
              elevation: 5,
            },
          ]}
        >
          <View
            style={{
              height: 4,
              width: 48,
              backgroundColor: "gray",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <Text
            style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}
          >
            Détails
          </Text>
          <Text style={{ color: "gray", textAlign: "center" }}>
            Contenu du panneau glissant
          </Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default DraggablePanel;

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const SwipeUp = ({ props, onPanelToggle, openAtHalf }) => {
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const { markerData, city } = props;

  const height = frame.height - insets.bottom; // Hauteur du panneau
  const translateY = useSharedValue(height); // Le panneau commence en bas de l'écran
  const startY = useSharedValue(0); // Position de départ du geste
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Réinitialiser la position du panneau lorsque l'écran est focalisé
      translateY.value = withTiming(height, { duration: 300 });
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
    }, [translateY, height, onPanelToggle])
  );

  useEffect(() => {
    if (openAtHalf) {
      translateY.value = withTiming(height * 0.5, { duration: 300 });
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 50%
    }
  }, [openAtHalf, translateY, height, onPanelToggle]);

  const onGestureEvent = (event) => {
    // Déplacement du panneau pendant le geste
    translateY.value = Math.max(
      0,
      Math.min(height, startY.value + event.nativeEvent.translationY)
    );
  };

  const onGestureBegin = (event) => {
    // Enregistrer la position de départ du geste
    startY.value = translateY.value;
  };

  const onGestureEnd = (event) => {
    const translationY = event.nativeEvent.translationY;

    if (translationY > 0) {
      // Geste vers le bas
      if (translateY.value > height * 0.75) {
        // Fermer le panneau si le déplacement est supérieur à 75% de la hauteur
        translateY.value = withTiming(height, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
      } else if (translateY.value > height * 0.25) {
        // Ouvrir le panneau à 50% si le déplacement est entre 25% et 75% de la hauteur
        translateY.value = withTiming(height * 0.5, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 50%
      } else {
        // Ouvrir le panneau à 100% si le déplacement est inférieur à 25% de la hauteur
        translateY.value = withTiming(0, { duration: 300 });
        setIsFullyOpen(true);
        if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 100%
      }
    } else {
      // Geste vers le haut
      if (translateY.value < height * 0.25) {
        // Ouvrir le panneau à 100% si le déplacement est inférieur à 25% de la hauteur
        translateY.value = withTiming(0, { duration: 300 });
        setIsFullyOpen(true);
        if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 100%
      } else if (translateY.value < height * 0.75) {
        // Ouvrir le panneau à 50% si le déplacement est entre 25% et 75% de la hauteur
        translateY.value = withTiming(height * 0.5, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 50%
      } else {
        // Fermer le panneau si le déplacement est supérieur à 75% de la hauteur
        translateY.value = withTiming(height, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    translateY.value = withTiming(height, { duration: 300 });
    setIsFullyOpen(false);
    if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
  };

  return (
    <View style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onBegan={onGestureBegin}
        onEnded={onGestureEnd}
        hitSlop={{ top: 20, bottom: 50, left: 50, right: 50 }} // Augmente la zone de détection
      >
        <Animated.View
          style={[animatedStyle, { height }]}
          className="absolute bottom-20 w-full h-full bg-white rounded-t-3xl p-4"
        >
          <View className="h-1 w-20 bg-gray-300 rounded-full self-center mb-2 top-1" />
          {markerData ? (
            <>
              <Text className="text-gray-500 text-center">
                {markerData.name}
              </Text>
              <Text className="text-gray-500 text-center">
                {markerData.description}
              </Text>
            </>
          ) : (
            <Text className="text-gray-700 font-semibold top-3 text-xl">
              {city}
            </Text>
          )}
          {isFullyOpen && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <FontAwesome name="times" size={24} color="white" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 20,
    padding: 10,
  },
});

export default SwipeUp;

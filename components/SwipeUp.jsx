import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const SwipeUp = ({
  children,
  onPanelToggle,
  openAtHalf,
  parentHeight,
  positions,
}) => {
  const translateY = useSharedValue(parentHeight); // Le panneau commence en bas de l'écran
  const startY = useSharedValue(0); // Position de départ du geste
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const positionValues = positions.map(
        (pos) => parentHeight - (pos / 100) * parentHeight
      );

      // Réinitialiser la position du panneau lorsque l'écran est focalisé
      translateY.value = withTiming(parentHeight - positionValues[0], {
        duration: 300,
      });
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
    }, [translateY, parentHeight, onPanelToggle])
  );

  useEffect(() => {
    console.log("openAtHalf", openAtHalf);
    if (openAtHalf) {
      translateY.value = withTiming(parentHeight * 0.5, { duration: 300 });
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 50%
    }
  }, [openAtHalf, translateY, parentHeight, onPanelToggle]);

  const onGestureEvent = (event) => {
    // Déplacement du panneau pendant le geste
    translateY.value = Math.max(
      0,
      Math.min(parentHeight, startY.value + event.nativeEvent.translationY)
    );
  };

  const onGestureBegin = (event) => {
    // Enregistrer la position de départ du geste
    startY.value = translateY.value;
  };

  const onGestureEnd = (event) => {
    
    const positionValues = positions.map(
      (pos) => parentHeight - (pos / 100) * parentHeight
    );

    // Trouver la position la plus proche
    let closestPosition = positionValues[0];
    let minDistance = Math.abs(translateY.value - closestPosition);

    for (let i = 1; i < positionValues.length; i++) {
      const distance = Math.abs(translateY.value - positionValues[i]);
      if (distance < minDistance) {
        closestPosition = positionValues[i];
        minDistance = distance;
      }
    }
    // Définir la position finale
    translateY.value = withTiming(closestPosition, { duration: 300 });

    // Mettre à jour l'état en fonction de la position finale
    if (closestPosition === 0) {
      setIsFullyOpen(true);
      if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 100%
    } else {
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à une position intermédiaire
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    console.log("close");
    translateY.value = withTiming(parentHeight, { duration: 300 });
    setIsFullyOpen(false);
    if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
  };

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onBegan={onGestureBegin}
        onEnded={onGestureEnd}
        hitSlop={{ top: 20, bottom: 50, left: 50, right: 50 }} // Augmente la zone de détection
      >
        <Animated.View
          style={[animatedStyle, { height: parentHeight }]}
          className="absolute bottom-0 w-full bg-white rounded-t-3xl p-4"
        >
          {children}
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

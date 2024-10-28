import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const SwipeUp = ({ props, onPanelToggle }) => {
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const { markerData, city } = props;

  const height = frame.height - (insets.bottom + insets.top);
  const translateY = useSharedValue(height); // Le panneau commence en bas de l'écran

  useFocusEffect(
    React.useCallback(() => {
      // Réinitialiser la position du panneau lorsque l'écran est focalisé
      translateY.value = withTiming(height, { duration: 300 });
      if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est ouvert
    }, [translateY, height, onPanelToggle])
  );

  const onGestureEvent = (event) => {
    // Déplacement du panneau pendant le geste
    translateY.value = Math.max(
      height * 0.5,
      height + event.nativeEvent.translationY
    );
  };

  const onGestureEnd = (event) => {
    // Seuil de fermeture : si le déplacement est supérieur à 100 pixels vers le bas
    if (
      event.nativeEvent.translationY > 100 ||
      event.nativeEvent.velocityY > 0
    ) {
      translateY.value = withTiming(height, { duration: 300 });
      if (onPanelToggle) onPanelToggle(false); // Indiquer que le panneau est fermé
    } else {
      translateY.value = withTiming(height * 0.5, { duration: 300 });
      if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onEnded={onGestureEnd}
        hitSlop={{ top: 20, bottom: 50, left: 50, right: 50 }} // Augmente la zone de détection
      >
        <Animated.View
          style={[animatedStyle, { height }]}
          className="absolute bottom-6 w-full bg-white rounded-t-3xl p-4"
        >
          <View className="h-1 w-20 bg-gray-300 rounded-full self-center mb-4 top-2" />
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
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SwipeUp;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  useSafeAreaInsets,
  useSafeAreaFrame,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const SwipeUp = ({ props, onPanelToggle, openAtHalf, parentHeight }) => {
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const { markerData, city } = props;

  const translateY = useSharedValue(parentHeight); // Start at the bottom of the screen
  const startY = useSharedValue(0); // Gesture start position
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  // Define the positions for min and max open
  const minClosedPosition = parentHeight - 35; // Position just above the tab bar
  const maxOpenPosition = parentHeight * 0.1; // Maximum open position (80% screen height)

  useFocusEffect(
    React.useCallback(() => {
      // Reset panel position when screen is focused
      translateY.value = withTiming(minClosedPosition, { duration: 300 });
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(false); // Notify panel is closed
    }, [translateY, parentHeight, onPanelToggle])
  );

  useEffect(() => {
    if (openAtHalf) {
      translateY.value = withTiming(parentHeight * 0.5, { duration: 300 });
      setIsFullyOpen(false);
      if (onPanelToggle) onPanelToggle(true); // Notify panel is open at 50%
    }
  }, [openAtHalf, translateY, parentHeight, onPanelToggle]);

  const onGestureEvent = (event) => {
    // Move panel during gesture, clamping between minClosedPosition and maxOpenPosition
    translateY.value = Math.max(
      maxOpenPosition,
      Math.min(minClosedPosition, startY.value + event.nativeEvent.translationY)
    );
  };

  const onGestureBegin = () => {
    // Record gesture start position
    startY.value = translateY.value;
  };

  const onGestureEnd = (event) => {
    const translationY = event.nativeEvent.translationY;

    if (translationY > 0) {
      // Gesture downwards
      if (translateY.value > parentHeight * 0.75) {
        // Snap to minClosedPosition when moving beyond 75%
        translateY.value = withTiming(minClosedPosition, { duration: 300 });
        setIsFullyOpen(false);
        openAtHalf = false;
        if (onPanelToggle) onPanelToggle(false); // Notify panel is closed
      } else if (translateY.value > parentHeight * 0.25) {
        // Open panel to 50% if moved between 25% and 75%
        translateY.value = withTiming(parentHeight * 0.5, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(true); // Notify panel is open at 50%
      } else {
        // Open panel to 80% if moved to less than 25% height
        translateY.value = withTiming(maxOpenPosition, { duration: 300 });
        setIsFullyOpen(true);
        if (onPanelToggle) onPanelToggle(true); // Notify panel is fully open
      }
    } else {
      // Gesture upwards
      if (translateY.value < parentHeight * 0.25) {
        // Open panel to 80% if moved to less than 25% height
        translateY.value = withTiming(maxOpenPosition, { duration: 300 });
        setIsFullyOpen(true);
        if (onPanelToggle) onPanelToggle(true); // Notify panel is fully open
      } else if (translateY.value < parentHeight * 0.75) {
        // Open panel to 50% if moved between 25% and 75%
        translateY.value = withTiming(parentHeight * 0.5, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(true); // Notify panel is open at 50%
      } else {
        // Close panel to minClosedPosition if moved beyond 75%
        translateY.value = withTiming(minClosedPosition, { duration: 300 });
        setIsFullyOpen(false);
        if (onPanelToggle) onPanelToggle(false); // Notify panel is closed
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    translateY.value = withTiming(minClosedPosition, { duration: 300 });
    setIsFullyOpen(false);
    if (onPanelToggle) onPanelToggle(false); // Notify panel is closed
  };

  return (
    <View style={{ flex: 1, height: 10 }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onBegan={onGestureBegin}
        onEnded={onGestureEnd}
        hitSlop={{ top: 20, bottom: 50, left: 50, right: 50 }} // Increase hit area
      >
        <Animated.View
          style={[animatedStyle, { height: parentHeight }]}
          className="absolute bottom-0 w-full bg-white rounded-t-3xl p-4"
        >
          <View className="h-1 w-20 bg-gray-300 rounded-full self-center mb-4 top-1" />
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

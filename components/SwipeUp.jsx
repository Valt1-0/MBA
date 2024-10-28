import React from "react";
import { View, Text } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
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

  const onGestureEvent = (event) => {
    translateY.value = Math.max(
      height * 0.5,
      height + event.nativeEvent.translationY
    );
  };

  const onGestureEnd = (event) => {
    if (event.nativeEvent.velocityY > 0) {
      translateY.value = withTiming(height, { duration: 300 });
    } else {
      translateY.value = withTiming(height * 0.5, { duration: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Contenu principal
        </Text>
      </View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onEnded={onGestureEnd}
        hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} // Augmente la zone de détection
      >
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
      </PanGestureHandler>
    </>
  );
};

export default DraggablePanel;

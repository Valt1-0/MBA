import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const SwipeUp = forwardRef(
  ({ children, parentHeight, positions, onPositionChange }, ref) => {
    const translateY = useSharedValue(parentHeight); // Le panneau commence en bas de l'écran
    const startY = useSharedValue(0); // Position de départ du geste
    const [isFullyOpen, setIsFullyOpen] = useState(false);

    // Define the positions for min and max open

    const positionValues = positions.map(
      (pos) => parentHeight - (pos / 100) * parentHeight
    );

    const minClosedPosition = positionValues[0]; // Position just above the tab bar
    const maxOpenPosition = positionValues[positions.length - 1]; // Maximum open position (80% screen height)

    const handlePostionChange = (position, duration) => {
      if (duration === 0) {
        translateY.value = position;
      } else {
        translateY.value = withTiming(position, { duration: duration });
      }

      if (onPositionChange) {
        onPositionChange(position, duration > 0 ? true : false);
      }
    };

    useFocusEffect(
      React.useCallback(() => {
        // Réinitialiser la position du panneau lorsque l'écran est focalisé

        handlePostionChange(positionValues[0], 300);
        setIsFullyOpen(false);
        //if (onPanelToggle) onPanelToggle(false); // Notify panel is closed
      }, [translateY, parentHeight])
    );

    useImperativeHandle(ref, () => ({
      openAtHalf: (pos) => {
        // Ouvrir le panneau à la position spécifiée
        let position = parentHeight * 0.5;
        if (pos !== undefined) {
          position = positionValues[pos];
        }
        handlePostionChange(position, 300);
        //translateY.value = withTiming(position, { duration: 300 });

        setIsFullyOpen(false);
        // //if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 50%
      },
      openAtFull: () => {
        //translateY.value = withTiming(0, { duration: 300 });
        handlePostionChange(0, 300);
        setIsFullyOpen(true);
      },
      close: () => {
        handlePostionChange(parentHeight, 300);
        // translateY.value = withTiming(parentHeight, { duration: 300 });
        setIsFullyOpen(false);
      },
      getTranslateY: () => translateY.value,
    }));

    // useEffect(() => {
    //   if (openAtHalf) {
    //     translateY.value = withTiming(parentHeight * 0.5, { duration: 300 });
    //     setIsFullyOpen(false);
    //     //if (onPanelToggle) onPanelToggle(true); // Notify panel is open at 50%
    //   }
    // }, [openAtHalf, translateY, parentHeight]);

    const onGestureEvent = (event) => {
      // Move panel during gesture, clamping between minClosedPosition and maxOpenPosition

      const posTranslate = Math.max(
        maxOpenPosition,
        Math.min(
          minClosedPosition,
          startY.value + event.nativeEvent.translationY
        )
      );
      handlePostionChange(posTranslate, 1);

      // Notify parent component of position change
      if (onPositionChange) {
        onPositionChange(translateY.value);
      }
    };

    const onGestureBegin = () => {
      // Record gesture start position
      startY.value = translateY.value;
    };

    const onGestureEnd = (event) => {
      // const positionValues = positions.map(
      //   (pos) => parentHeight - (pos / 100) * parentHeight
      // );

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

      handlePostionChange(closestPosition, 300);
      //translateY.value = withTiming(closestPosition, { duration: 300 });

      // Mettre à jour l'état en fonction de la position finale
      if (closestPosition === 0) {
        setIsFullyOpen(true);
        //if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à 100%
      } else {
        setIsFullyOpen(false);
        //if (onPanelToggle) onPanelToggle(true); // Indiquer que le panneau est ouvert à une position intermédiaire
      }
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const handleClose = () => {
      handlePostionChange(positionValues[0], 300);
      //translateY.value = withTiming(positionValues[0], { duration: 300 });
      setIsFullyOpen(false);
      //if (onPanelToggle) onPanelToggle(false); // Notify panel is closed
    };

    return (
      <View style={{ flex: 1, height: "100%" }}>
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
            {children}
            {isFullyOpen && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <FontAwesome name="times" size={24} color="white" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
);

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

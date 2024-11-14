import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View, TouchableWithoutFeedback, Animated, Text } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider"; // Importer le composant Slider

const RangeSlider = forwardRef(({ onSlidingComplete }, ref) => {
  const widthAnim = useRef(new Animated.Value(64)).current; // Valeur initiale de la largeur (56 correspond à 14 * 4)
  const opacityAnim = useRef(new Animated.Value(0)).current; // Valeur initiale de l'opacité
  const [isExpanded, setIsExpanded] = useState(false); // État pour suivre si la vue est élargie
  const [sliderValue, setSliderValue] = useState(1); // Valeur initiale du curseur
  const allowedValues = [1, 5, 10, 15, 20]; // Valeurs autorisées

  useImperativeHandle(ref, () => ({
    close: () => {
      close();
    },
  }));

  const handlePress = () => {
    console.log("isExpanded", isExpanded);
    if (isExpanded) {
      close();
    } else {
      // Élargir la largeur avant d'animer l'opacité à 1
      Animated.timing(widthAnim, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsExpanded(true);
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const close = () => {
    // Animer l'opacité à 0 avant de rétracter la largeur
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(widthAnim, {
        toValue: 64,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsExpanded(false);
      });
    });
  };

  const handleValueChange = (value) => {
    // Trouver la valeur autorisée la plus proche
    const closestValue = allowedValues.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    setSliderValue(closestValue);
  };

  return (
    <View className="absolute bottom-10 right-5 z-10">
      <TouchableWithoutFeedback
        onPress={handlePress}
      >
        <Animated.View
          style={{ width: widthAnim }}
          className="h-16 bg-white border border-slate-300 rounded-3xl items-center justify-center p-2"
        >
          {!isExpanded ? (
            <FontAwesome6 name="ruler" size={28} color="#777777" />
          ) : (
            <Animated.View
              style={{ opacity: opacityAnim }}
              className="flex items-center justify-center w-full"
            >
              <Slider
                style={{ width: "100%", height: 20, zIndex: 10 }}
                minimumValue={allowedValues[0]}
                maximumValue={allowedValues[allowedValues.length - 1]}
                step={1}
                value={sliderValue}
                onValueChange={handleValueChange}
                onSlidingComplete={onSlidingComplete} // Ajoutez la méthode onSlidingComplete
                minimumTrackTintColor="#DDC97A"
                maximumTrackTintColor="#D3D3D3"
                thumbTintColor="#DDC97A"
              />
              <Text className="text-center mt-2">{sliderValue} km</Text>
            </Animated.View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
});

export default RangeSlider;

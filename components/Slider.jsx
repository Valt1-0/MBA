import React, { useRef } from "react";
import { View, TouchableWithoutFeedback, Animated } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

const RangeSlider = () => {
  const animation = useRef(new Animated.Value(1)).current; // Animation pour contrôler l'échelle

  const expandView = () => {
    Animated.timing(animation, {
      toValue: 1.5, // Élargir à 150% de la taille d'origine
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const collapseView = () => {
    Animated.timing(animation, {
      toValue: 1, // Rétrécir à la taille d'origine
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="bg-slate-600 flex items-center justify-center h-full">
      {/* Zone qui sera élargie */}
      <TouchableWithoutFeedback onPress={expandView} onLongPress={collapseView}>
        <Animated.View
          style={{
            transform: [{ scale: animation }], // Appliquer la transformation d'échelle
          }}
          className="w-14 h-14 bg-white border border-slate-300 rounded-3xl flex items-center justify-center"
        >
          <FontAwesome6 name="ruler" size={25} color="#777777" />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default RangeSlider;

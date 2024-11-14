import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View, TouchableWithoutFeedback, Animated, Text } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

const RangeSlider = forwardRef(({ onSlidingComplete }, ref) => {
  const widthAnim = useRef(new Animated.Value(64)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const allowedValues = [1, 5, 10, 15, 20];

  useImperativeHandle(ref, () => ({
    close: () => {
      close();
    },
  }));

  const handlePress = () => {
    if (isExpanded) {
      close();
    } else {
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
    const closestValue = allowedValues.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    setSliderValue(closestValue);
  };

  return (
    <View style={{ position: 'absolute', bottom: 10, right: 5, zIndex: 10 }}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View
          style={{ width: widthAnim, height: 64, backgroundColor: 'white', borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 8 }}
        >
          {!isExpanded ? (
            <FontAwesome6 name="ruler" size={24} color="#777777" />
          ) : (
            <Animated.View style={{ opacity: opacityAnim, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Slider
                style={{ width: "100%", height: 20, zIndex: 10 }}
                minimumValue={allowedValues[0]}
                maximumValue={allowedValues[allowedValues.length - 1]}
                step={1}
                value={sliderValue}
                onValueChange={handleValueChange}
                onSlidingComplete={onSlidingComplete}
                minimumTrackTintColor="#DDC97A"
                maximumTrackTintColor="#D3D3D3"
                thumbTintColor="#DDC97A"
              />
              <Text style={{ textAlign: 'center', marginTop: 8 }}>{sliderValue} km</Text>
            </Animated.View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
});

export default RangeSlider;
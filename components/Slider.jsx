import React, { useState } from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { tw } from "nativewind";

const RangeSlider = () => {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [range, setRange] = useState([minValue, maxValue]);

  const handleMinValueChange = (value) => {
    setRange([value, range[1]]);
  };

  const handleMaxValueChange = (value) => {
    setRange([range[0], value]);
  };

  return (
    <View style={tw`p-4`}>
      <Text style={tw`mb-2 text-lg font-bold`}>Range Slider</Text>
      <Text style={tw`mb-2`}>Min Value: {range[0]}</Text>
      <Text style={tw`mb-2`}>Max Value: {range[1]}</Text>
      <Slider
        style={tw`mb-4`}
        minimumValue={minValue}
        maximumValue={maxValue}
        value={range[0]}
        onValueChange={handleMinValueChange}
        minimumTrackTintColor="#DDC97A"
        maximumTrackTintColor="#000000"
        thumbTintColor="#DDC97A"
      />
      <Slider
        style={tw`mb-4`}
        minimumValue={minValue}
        maximumValue={maxValue}
        value={range[1]}
        onValueChange={handleMaxValueChange}
        minimumTrackTintColor="#DDC97A"
        maximumTrackTintColor="#000000"
        thumbTintColor="#DDC97A"
      />
    </View>
  );
};

export default RangeSlider;

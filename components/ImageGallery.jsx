import { Image, ScrollView, View, Text } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const ImageGallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <FontAwesome name="image" size={24} color="#DDC97A" />
        <Text className="ml-3 text-gray-700 text-base">Photos</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="ml-8"
      >
        {images.map((images, index) => (
          <View key={index} className="mr-2">
            <Image
              source={{
                uri: images.uri || `data:image/jpeg;base64,${images.base64}`,
              }}
              className="w-32 h-32 rounded-xl"
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ImageGallery;

import { Image, ScrollView, View, Text } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const ImageGallery = ({ images }) => {
  if (!images || images.length === 0) return null;

    const getImageSource = (image) => {
      // Si l'image est déjà un URI
      if (typeof image === "string" && image.startsWith("http")) {
        return { uri: image };
      }
      // Si l'image est un objet avec une propriété base64
      if (image.base64) {
        return { uri: `data:image/jpeg;base64,${image.base64}` };
      }
      // Si l'image est directement en base64
      if (typeof image === "string") {
        return { uri: `data:image/jpeg;base64,${image}` };
      }
      return image;
    };

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
        {images.map((image, index) => (
          <View key={index} className="mr-2">
            <Image
              source={getImageSource(image)}
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

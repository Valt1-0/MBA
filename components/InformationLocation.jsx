import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { deletePlace } from "../utils/functions"; // Assurez-vous d'importer la fonction deletePlace
import { UserContext } from "../context/UserContext";
import ImageGallery from "./ImageGallery";

export default function ContactInfo({ selectedPlace }) {
  const [address, setAddress] = useState("");
  const { userInfo } = useContext(UserContext);
  const rating = selectedPlace?.rating || 0;

  useEffect(() => {
    if (selectedPlace) {
      const { longitude, latitude } = selectedPlace;
      const apiKey = process.env.EXPO_PUBLIC_OPEN_ROUTE_SERVICE_API_KEY;
      const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lon=${longitude}&point.lat=${latitude}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const address = data.features[0].properties.label;
          setAddress(address);
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
        });
    }
  }, [selectedPlace]);

  console.log("selectedPlace", selectedPlace.images);

  const handleDelete = async () => {
    try {
      const result = await deletePlace(selectedPlace.id);
      if (result.success) {
        Alert.alert("Succès", result.message);
      } else {
        Alert.alert("Erreur", result.error);
      }
    } catch (error) {
      console.error("Error deleting place:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la suppression du lieu."
      );
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesome key={`full-${i}`} name="star" size={20} color="#DDC97A" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesome key="half" name="star-half-o" size={20} color="#DDC97A" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesome
          key={`empty-${i}`}
          name="star-o"
          size={20}
          color="#DDC97A"
        />
      );
    }

    return stars;
  };

  return (
    <View className="flex-1 p-4">
      {/* Adresse */}
      <View className="flex-row items-center mb-4">
        <FontAwesome name="map-marker" size={24} color="#DDC97A" />
        <Text className="ml-3 text-gray-700 text-base">{address}</Text>
      </View>
      {/* Horaires */}
      {selectedPlace.hourly && (
        <View className="flex-row items-center mb-4">
          <FontAwesome name="clock-o" size={24} color="#DDC97A" />
          <Text className="ml-3 text-gray-700 text-base">
            <Text className="text-green-600 font-semibold">Ouvert</Text>
            <Text> • Ferme à 18:30</Text>
          </Text>
        </View>
      )}
      {/* Site web */}
      {selectedPlace.WebSite && (
        <View className="flex-row items-center mb-4">
          <FontAwesome name="globe" size={24} color="#DDC97A" />
          <TouchableOpacity onPress={() => console.log("Ouvrir le site web")}>
            <Text className="ml-3 text-blue-500 underline text-base">
              {selectedPlace.WebSite}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Description */}
      <View className="flex-row items-center mb-4">
        <FontAwesome name="info" size={24} color="#DDC97A" />
        <Text className="ml-3 text-gray-700 text-base">
          {selectedPlace.description}
        </Text>
      </View>
      {/* Suggérer une modification */}
      <View className="flex-row items-center mb-4">
        <FontAwesome name="pencil" size={24} color="#DDC97A" />
        <TouchableOpacity
          onPress={() => console.log("Suggérer une modification")}
          className="ml-3"
        >
          <Text className="text-gray-700 text-base">Suggérer une modif.</Text>
        </TouchableOpacity>
      </View>
      {/* Bouton Supprimer */}
      {userInfo?.uid === selectedPlace?.createdBy?.uid && (
        <View className="flex-row items-center mb-4">
          <FontAwesome name="trash" size={24} color="#EF4444" />
          <TouchableOpacity onPress={handleDelete} className="ml-3">
            <Text className="text-red-500 text-base">Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
      {selectedPlace.rating && (
        <View className="flex-row items-center mb-4">
          <FontAwesome name="star" size={24} color="#DDC97A" />
          <View className="ml-3">
            <View className="flex-row">{renderStars()}</View>
            <Text className="text-gray-700 text-sm mt-1">
              {rating.toFixed(1)} / 5
            </Text>
          </View>
        </View>
      )}
      {selectedPlace?.images?.length > 0 && (
        <ImageGallery images={selectedPlace.images} />
      )}
    </View>
  );
}
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getColorByType } from "../../utils/functions";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      const placesCollection = collection(db, "places");
      const placesSnapshot = await getDocs(placesCollection);
      const placesList = placesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlaces(placesList);
    };

    fetchPlaces();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      setLocation(userCoords);
    })();
  }, []);

  const handleMarkerPress = (place) => {};

  return (
    <>
      <StatusBar hidden={true} />
      <View className="flex-1">
        {location ? (
          <MapView
            style={{ width: "100%", height: "100%" }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            onPress={() => setSelectedPlace(null)}
          >
            {places.map((place) => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedPlace(place);
                }}
              >
                <TouchableOpacity>
                  <FontAwesome
                    name="map-pin"
                    size={25}
                    color={getColorByType(place.type)}
                  />
                </TouchableOpacity>
              </Marker>
            ))}
          </MapView>
        ) : null}

        {selectedPlace && (
          <View className="absolute bottom-12 left-20 right-20 h-28 bg-white p-4 rounded-lg shadow-lg">
            <Text className="text-lg font-bold text-center">
              {selectedPlace.name}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {selectedPlace.type}
            </Text>

            <View className="flex-row justify-center items-center mt-2 gap-6">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm">42</Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log("UP");
                    setActiveButton(activeButton === "up" ? null : "up");
                  }}
                >
                  <Entypo
                    name="arrow-bold-up"
                    size={24}
                    color={activeButton === "up" ? "#DDC97A" : "gray"}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center gap-1">
                <Text className="text-sm">5</Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log("DOWN");
                    setActiveButton(activeButton === "down" ? null : "down");
                  }}
                >
                  <Entypo
                    name="arrow-bold-down"
                    size={24}
                    color={activeButton === "down" ? "#DDC97A" : "gray"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

export default HomeScreen;

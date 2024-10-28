import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";  
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Entypo, Zocial } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getColorByType } from "../../utils/functions";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const HomeScreen = () => {
  const [places, setPlaces] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const mapRef = useRef(null);

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
        latitudeDelta: 0.38,
        longitudeDelta: 0.28,
      };

      if (mapRef.current) {
        mapRef.current.animateCamera(
          {
            altitude: 2000,
            center: userCoords,
            zoom: Platform.OS === "ios" ? 0 : 19,
          },
          { duration: 200 }
        );
      }
    })();
  },[]);

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
  };

  return (
    <>
      <StatusBar hidden={true} />
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          followsUserLocation={true}
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
                handleMarkerPress(place);
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
        {selectedPlace && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{selectedPlace.name}</Text>
            <Text style={styles.infoText}>{selectedPlace.type}</Text>
            <View style={styles.voteContainer}>
              <View style={styles.voteButtonContainer}>
                <Text style={styles.voteCount}>42</Text>
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
              <View style={styles.voteButtonContainer}>
                <Text style={styles.voteCount}>5</Text>
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

const styles = {
  infoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 24,
  },
  voteButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voteCount: {
    fontSize: 14,
  },
};

export default HomeScreen;

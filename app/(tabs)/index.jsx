import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getColorByType } from "../../utils/functions";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeUp from "../../components/SwipeUp";

const HomeScreen = () => {
  const [places, setPlaces] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [city, setCity] = useState(null);
  const mapRef = useRef(null);
  const [followUser, setFollowUser] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

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

      let userLocation = await Location.getLastKnownPositionAsync({
        maxAge: 300000,
      });

      if (!userLocation) {
        userLocation = await Location.getCurrentPositionAsync({});
      }

      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.38,
        longitudeDelta: 0.28,
      };

      if (mapRef.current) {
        setFollowUser(false);
        mapRef.current.animateCamera(
          {
            altitude: 2000,
            center: userCoords,
            zoom: Platform.OS === "ios" ? 0 : 19,
          },
          { duration: 350 }
        );
        setFollowUser(true);
      }

      const reverseGeocode = async (latitude, longitude) => {
        const geocoded = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        return geocoded;
      };

      const locationDetails = await reverseGeocode(
        userCoords.latitude,
        userCoords.longitude
      );

      if (locationDetails.length > 0) {
        const { city } = locationDetails[0];
        setCity(city);
        console.log("Nearest city:", city);
      } else {
        console.log("No city found for these coordinates.");
      }
    })();
  }, []);

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
  };
  const handleMapPress = () => {
    console.log("Map pressed");
    setFollowUser(false); // Désactivez le suivi de l'utilisateur lors de l'interaction avec la carte
  };

  const handleMyLocationPress = async () => {
    let userLocation = await Location.getLastKnownPositionAsync({
      maxAge: 300000,
    });

    if (!userLocation) {
      userLocation = await Location.getCurrentPositionAsync({});
    }

    const userCoords = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.38,
      longitudeDelta: 0.28,
    };

    if (mapRef.current) {
      setFollowUser(false);
      mapRef.current.animateCamera(
        {
          altitude: 2000,
          center: userCoords,
          zoom: Platform.OS === "ios" ? 0 : 19,
        },
        { duration: 350 }
      );
      setFollowUser(true);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden={true} />
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          followsUserLocation={followUser}
          showsUserLocation={true}
          onPress={() => {
            setSelectedPlace(null);
          }}
          onTouchStart={handleMapPress}
          showsMyLocationButton={true}
          showsPointsOfInterest={false}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
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
        {Platform.OS === "ios" && !followUser &&(
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={handleMyLocationPress}
          >
            <FontAwesome name="location-arrow" size={24} color="white" />
          </TouchableOpacity>
        )}
        <SwipeUp
          props={{
            city: city,
            markerData: selectedPlace,
          }}
          onPanelToggle={setPanelOpen}
        />
      </View>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  myLocationButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});
export default HomeScreen;

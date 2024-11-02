import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getColorByType, getIconByType } from "../../utils/functions";
import { db } from "../../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeUp from "../../components/SwipeUp";
import { customMapStyle } from "../../utils/customMap";
import * as NavigationBar from "expo-navigation-bar";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { useSegments, usePathname } from "expo-router";
import RangeSlider from "../../components/Slider";

const HomeScreen = () => {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [city, setCity] = useState(null);
  const mapRef = useRef(null);
  const [followUser, setFollowUser] = useState(true);
  const [parentHeight, setParentHeight] = useState(0);
  const swipeUpRef = useRef(null);
  const segments = useSegments();
  const pathName = usePathname();
  const [sliderValue, setSliderValue] = useState(1);
  const [location, setLocation] = useState(null);
  const sliderRef = useRef(null);
  const buttonAnim = useRef(new Animated.Value(0)).current;

  async function queryNearbyPlaces(center, radiusInM) {
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];
    for (const b of bounds) {
      const q = query(
        collection(db, "places"),
        orderBy("geohash"),
        startAt(b[0]),
        endAt(b[1])
      );

      promises.push(getDocs(q));
    }

    const snapshots = await Promise.all(promises);

    const matchingDocs = [];

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const lat = doc.get("location").latitude;
        const lng = doc.get("location").longitude;

        // We have to filter out a few false positives due to GeoHash accuracy, but most will match
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push(doc);
        }
      }
    }

    return matchingDocs;
  }

  useLayoutEffect(() => {
    console.log("useLayoutEffect:");
  }, []);

  useEffect(() => {
    console.log("pathName:", pathName);
  }, [pathName]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("white");
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    console.log("location:", location);
    const center = [location?.latitude, location?.longitude];
    const radiusInM = sliderValue * 100; // Rayon en mètres

    queryNearbyPlaces(center, radiusInM).then((docs) => {
      const placesData = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("placesData:", placesData);
      setPlaces(placesData);
    });
  }, [location, sliderValue]);

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

      setLocation(userCoords);

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
        // console.log("Nearest city:", city);
      } else {
        console.log("No city found for these coordinates.");
      }
    })();
  }, []);

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);

    // Obtenez la hauteur de l'écran
    const screenHeight = parentHeight;

    // Calculez la hauteur de votre composant de swipe lorsqu'il est ouvert à 50%
    const swipeHeight = screenHeight * -0.3;

    // Calculez le décalage en latitude en fonction de la hauteur du swipe
    const latitudeDelta = 0.01; // Utilisé pour le niveau de zoom
    const offset = (swipeHeight / screenHeight) * latitudeDelta;

    // Ajustez la latitude pour décaler la région vers le haut
    const adjustedLatitude = place.latitude + offset;

    const userCoords = {
      latitude: adjustedLatitude,
      longitude: place.longitude,
    };

    mapRef.current.animateCamera(
      {
        altitude: 2000,
        center: userCoords,
        zoom: Platform.OS === "ios" ? 0 : 19,
      },
      { duration: 350 }
    );
    setFollowUser(false);
    swipeUpRef?.current?.openAtHalf(1);
  };
  const handleMapPress = () => {
    sliderRef?.current?.close();
    setFollowUser(false); // Désactivez le suivi de l'utilisateur lors de l'interaction avec la carte
  };

  const handleSwipePositionChange = (newPosition, final = false) => {
    const maxPosition = -(parentHeight * 0.5); // Définissez votre valeur maximale ici
    const targetValue = Math.max(-(parentHeight - newPosition), maxPosition);

    Animated.timing(buttonAnim, {
      toValue: targetValue, // La position verticale en fonction du swipe
      duration: final ? 300 : 0, // Durée à 0 pour suivre en temps réel
      useNativeDriver: false,
    }).start();
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
      <View
        className={"flex-1 h-full"}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setParentHeight(height);
        }}
      >
        <MapView
          ref={mapRef}
          customMapStyle={customMapStyle}
          style={{ width: "100%", height: "100%" }}
          followsUserLocation={followUser}
          showsUserLocation={true}
          onPress={() => {
            setSelectedPlace(null);
          }}
          showsIndoors={false}
          showsTraffic={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          onTouchStart={handleMapPress}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              tracksViewChanges={false}
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
                <FontAwesome6
                  name={getIconByType(place.type)}
                  size={20}
                  color="#FF0000AA"
                />
              </TouchableOpacity>
            </Marker>
          ))}
        </MapView>
        {console.log(
          "parentHeight:",
          -(parentHeight * 0.52),
          buttonAnim._value,
          buttonAnim._value < -(parentHeight * 0.4)
        )}

        <Animated.View
          style={{
            transform: [{ translateY: buttonAnim }],
          }}
        >
          {Platform.OS === "ios" && !followUser && (
            <TouchableOpacity
              className="absolute bottom-10 left-5"
              onPress={handleMyLocationPress}
            >
              <View
                style={{ width: 64 }}
                className="h-16 bg-white border border-slate-300 rounded-3xl items-center justify-center p-2"
              >
                <FontAwesome name="location-arrow" size={20} color="#777777" />
              </View>
            </TouchableOpacity>
          )}
          <RangeSlider
            ref={sliderRef}
            onSlidingComplete={(value) => setSliderValue(value)}
          />
        </Animated.View>

        <SwipeUp
          ref={swipeUpRef}
          parentHeight={parentHeight}
          onPositionChange={handleSwipePositionChange}
          positions={[10, 50, 100]} // Positions en pourcentage
        >
          <View className="h-1 w-20 bg-gray-300 rounded-full self-center mb-2 top-1" />
          {selectedPlace ? (
            <>
              <Text className="text-gray-500 text-center">
                {selectedPlace.name}
              </Text>
              <Text className="text-gray-500 text-center">
                {selectedPlace.description}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-gray-700 font-semibold top-3 text-xl">
                Nouveautés à {city}
              </Text>

              <FlatList
                horizontal
                data={places}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleMarkerPress(item)}>
                    <View
                      style={{
                        width: 160,
                        height: 160,
                        backgroundColor: "white",
                        borderRadius: 10,
                        padding: 8,
                        margin: 8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}
                    >
                      <FontAwesome6
                        name={getIconByType(item.type)}
                        size={20}
                        color={getColorByType(item.type)}
                      />
                      <Text style={{ color: "#4A4A4A" }}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              ></FlatList>
            </>
          )}
        </SwipeUp>
      </View>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({});
export default HomeScreen;

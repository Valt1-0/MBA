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
  TextInput,
  Button,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
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
  const [state, setState] = useState({
    places: [],
    selectedPlace: null,
    city: null,
    followUser: true,
    parentHeight: 0,
    sliderValue: 1,
    location: null,
    userLocation: null,
    pourcentage: 0,
  });
  const MERCATOR_OFFSET = Math.pow(2, 28);
  const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;
  const { width, height } = Dimensions.get("window");
  const mapRef = useRef(null);
  const swipeUpRef = useRef(null);
  const sliderRef = useRef(null);
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const pathName = usePathname();
  const [temporaryMarker, setTemporaryMarker] = useState(null); // Marqueur temporaire
  const blinkOpacity = useRef(new Animated.Value(0.5)).current; // Animation de clignotement

  const setAllValues = (newValues) => {
    setState((prevState) => ({
      ...prevState,
      ...newValues,
    }));
  };

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
    if (!state.location) return;
    console.log("location:", state.location);
    const center = [state.location?.latitude, state.location?.longitude];
    const radiusInM = state.sliderValue * 100; // Rayon en mètres

    queryNearbyPlaces(center, radiusInM).then((docs) => {
      const placesData = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllValues({ places: placesData });
    });
  }, [state.location, state.sliderValue]);

  const getLatLongDelta = (zoom, latitude) => {
    const LONGITUDE_DELTA = Math.exp(Math.log(360) - zoom * Math.LN2);
    const ONE_LATITUDE_DEGREE_IN_METERS = 111.32 * 1000;
    const accurateRegion =
      LONGITUDE_DELTA *
      (ONE_LATITUDE_DEGREE_IN_METERS * Math.cos(latitude * (Math.PI / 180)));
    const LATITUDE_DELTA = accurateRegion / ONE_LATITUDE_DEGREE_IN_METERS;

    return [LONGITUDE_DELTA, LATITUDE_DELTA];
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      let altitude = 2000;
      let userLocation = await Location.getLastKnownPositionAsync({
        maxAge: 300000,
      });

      if (!userLocation) {
        userLocation = await Location.getCurrentPositionAsync({});
      }
      console.log("userLocation.coords:", userLocation.coords);
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: getLatLongDelta(15, userLocation.coords.latitude),
        longitudeDelta: getLatLongDelta(15, userLocation.coords.longitude),
      };

      setAllValues({ location: userCoords });

      if (mapRef.current) {
        setAllValues({ followUser: false });
        await updateCamera(userCoords, state.pourcentage, altitude);
        setAllValues({ followUser: true });
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
        setAllValues({ city });
        // console.log("Nearest city:", city);
      } else {
        console.log("No city found for these coordinates.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.selectedPlace) return;
    const userCoords = {
      latitude: state.selectedPlace.latitude,
      longitude: state.selectedPlace.longitude,
    };
    const updatePlace = async () => {
      await updateCamera(userCoords, state.pourcentage, 2000).then(() => {
        swipeUpRef?.current?.openAtHalf(1);
      });
    };

    updatePlace();
  }, [state.selectedPlace]);

  const handleMarkerPress = async (place) => {
    setAllValues({ selectedPlace: place, followUser: false });
  };

  const handleMapPress = () => {
    sliderRef?.current?.close();
    setAllValues({ followUser: false }); // Désactivez le suivi de l'utilisateur lors de l'interaction avec la carte
  };

  const handleSwipePositionChange = async (
    newPosition,
    final = false,
    end = false
  ) => {
    console.log("swipePosition:", newPosition);
    const maxPosition = -(state.parentHeight * 0.5); // Définissez votre valeur maximale ici
    const targetValue = Math.max(
      -(state.parentHeight - newPosition),
      maxPosition
    );

    Animated.timing(buttonAnim, {
      toValue: targetValue, // La position verticale en fonction du swipe
      duration: final ? 300 : 0, // Durée à 0 pour suivre en temps réel
      useNativeDriver: false,
    }).start();

    const newPourcentage = (1 - newPosition / state.parentHeight) / 2;
    setAllValues({ pourcentage: newPourcentage });

    console.log("state.selectedPlace:", state.selectedPlace);

    if (state.userLocation) {
      let center = state.userLocation;

      if (state.selectedPlace)
        center = {
          latitude: state.selectedPlace.location.latitude,
          longitude: state.selectedPlace.location.longitude,
        };

      console.log("center:", center);

      const { northEast, southWest } = await mapRef.current.getMapBoundaries();

      if (!northEast || !southWest) {
        console.error("Invalid map boundaries");
        return;
      }

      const latOffset =
        (northEast.latitude - southWest.latitude) * newPourcentage;

      const adjustedLatitude = center.latitude - latOffset;
      center.latitude = adjustedLatitude;
      console.log("update CAmera :");
      updateCamera(center, newPourcentage);
    }
  };

  const updateCamera = async (center, lastPourcentage, altitude) => {
    const userCoords = center;
    const cameraConfig = {
      center: userCoords,
      pitch: 0,
      heading: 0,
      zoom: Platform.OS === "ios" ? 15 : 15,
    };

    if (altitude !== undefined) {
      cameraConfig.altitude = altitude;
    }

    await mapRef.current.animateCamera(cameraConfig, { duration: 10 });
  };

  const handleMyLocationPress = async () => {
    let userLocation = await Location.getLastKnownPositionAsync({
      maxAge: 300000,
    });

    if (!userLocation) {
      userLocation = await Location.getCurrentPositionAsync({});
    }

    setAllValues({
      userLocation: {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
    });

    const userCoords = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    };

    if (mapRef.current) {
      await updateCamera(userCoords, state.pourcentage);
      setAllValues({ followUser: true });
    }
  };

  const handleUserLocationChange = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    setAllValues({ userLocation: { latitude, longitude } });

    if (state.followUser) {
      const center = {
        latitude,
        longitude,
      };
      if (state.pourcentage >= 0.1)
        await updateCamera(center, state.pourcentage);
      else await updateCamera(center, 0);
    }
  };

  useEffect(() => {
    if (temporaryMarker) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkOpacity, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [temporaryMarker]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden={true} />
      <View
        className={"flex-1 h-full"}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setAllValues({ parentHeight: height });
        }}
      >
        <MapView
          ref={mapRef}
          customMapStyle={customMapStyle}
          style={{ width: "100%", height: "100%" }}
          followsUserLocation={false}
          showsUserLocation={true}
          onPress={() => {
            setAllValues({ selectedPlace: null });
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
          onUserLocationChange={handleUserLocationChange}
          loadingEnabled={true}
        >
          {state.places.map((place) => (
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
          {temporaryMarker && (
            <Marker
              coordinate={{
                latitude: temporaryMarker.latitude,
                longitude: temporaryMarker.longitude,
              }}
            >
              <Animated.View style={{ opacity: blinkOpacity }}>
                <FontAwesome name="map-marker" size={30} color="#FF0000" />
              </Animated.View>
            </Marker>
          )}
        </MapView>
        <Animated.View
          style={{
            transform: [{ translateY: buttonAnim }],
          }}
        >
          {Platform.OS === "ios" && !state.followUser && (
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
            onSlidingComplete={(value) => setAllValues({ sliderValue: value })}
          />
        </Animated.View>

        <SwipeUp
          ref={swipeUpRef}
          parentHeight={state.parentHeight}
          onPositionChange={handleSwipePositionChange}
          positions={[10, 50, 100]} // Positions en pourcentage
        >
          <View className="h-1 w-20 bg-gray-300 rounded-full self-center mb-2 top-1" />
          {state.selectedPlace ? (
            <>
              <Text className="text-gray-500 text-center">
                {state.selectedPlace.name}
              </Text>
              <Text className="text-gray-500 text-center">
                {state.selectedPlace.description}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-gray-700 font-semibold top-3 text-xl">
                Nouveautés à {state.city}
              </Text>

              <FlatList
                horizontal
                data={state.places}
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
              />
            </>
          )}
        </SwipeUp>
      </View>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;

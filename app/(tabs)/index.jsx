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
      console.log("placesData:", placesData);
      setAllValues({ places: placesData });
    });
  }, [state.location, state.sliderValue]);

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
      };

      setAllValues({ location: userCoords });

      if (mapRef.current) {
        setAllValues({ followUser: false });
        await updateCamera(userCoords, state.pourcentage);
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
      await updateCamera(userCoords, state.pourcentage);
      swipeUpRef?.current?.openAtHalf(1);
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

  const handleSwipePositionChange = async (newPosition, final = false) => {
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

    if (state.userLocation && final) {
      const center = {
        latitude: state.selectedPlace
          ? state.selectedPlace.latitude
          : state.userLocation.latitude,
        longitude: state.selectedPlace
          ? state.selectedPlace.longitude
          : state.userLocation.longitude,
      };

      await updateCamera(center, newPourcentage);
    }
  };

  //     function mercatorLatitudeToY(latitude) {
  //       return Math.round(
  //         MERCATOR_OFFSET -
  //           (MERCATOR_RADIUS *
  //             Math.log(
  //               (1 + Math.sin(latitude * (Math.PI / 180))) /
  //                 (1 - Math.sin(latitude * (Math.PI / 180)))
  //             )) /
  //             2
  //       );
  //     }

  //   function mercatorLongitudeToX(longitude) {
  //     return Math.round(
  //       MERCATOR_OFFSET + (MERCATOR_RADIUS * longitude * Math.PI) / 180
  //     );
  //   }

  //   function mercatorXToLongitude(x) {
  //     return (((x - MERCATOR_OFFSET) / MERCATOR_RADIUS) * 180) / Math.PI;
  //   }

  //   function mercatorYToLatitude(y) {
  //     return (
  //       ((Math.PI / 2 -
  //         2 * Math.atan(Math.exp((y - MERCATOR_OFFSET) / MERCATOR_RADIUS))) *
  //         180) /
  //       Math.PI
  //     );
  //   }

  //   function mercatorAdjustLatitudeByOffsetAndZoom(latitude, offset, zoom) {
  //     return mercatorYToLatitude(
  //       mercatorLatitudeToY(latitude) + (offset << (21 - zoom))
  //     );
  //   }

  //   function mercatorAdjustLongitudeByOffsetAndZoom(longitude, offset, zoom) {
  //     return mercatorXToLongitude(
  //       mercatorLongitudeToX(longitude) + (offset << (21 - zoom))
  //     );
  //   }

  // function mercatorDegreeDeltas(latitude, longitude, width, height, zoom) {
  //   if (!zoom) {
  //     zoom = 20;
  //   }

  //   const deltaX = width / 2;
  //   const deltaY = height / 4;

  //   const northLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
  //     latitude,
  //     deltaY * -1,
  //     zoom
  //   );
  //   const westLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
  //     longitude,
  //     deltaX * -1,
  //     zoom
  //   );
  //   const southLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
  //     latitude,
  //     deltaY,
  //     zoom
  //   );
  //   const eastLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
  //     longitude,
  //     deltaY,
  //     zoom
  //   );

  //   const latitudeDelta = Math.abs(northLatitude - southLatitude);
  //   const longitudeDelta = Math.abs(eastLongitude - westLongitude);

  //   return { latitudeDelta, longitudeDelta };
  // }

  //   const getOffset = (zoom, heading, screenRatio) => {
  //     const BASE_OFFSET = -0.005 * screenRatio; // Ajuster   si nécessaire

  //     const offset = BASE_OFFSET / Math.pow(2, zoom); // Ajustement basé sur le zoom
  //     const radHeading = heading * (Math.PI / 180); // Convertir le heading en radians

  //     // Calculer le décalage basé sur le heading
  //     const offsetLatitude = offset * Math.cos(radHeading);
  //     const offsetLongitude = offset * Math.sin(radHeading);

  //     // Inverser le décalage pour le garder en bas de l'écran
  //     return {
  //       offsetLatitude: offsetLatitude,
  //       offsetLongitude: offsetLongitude,
  //     };
  //   };

  const calculateZoomLevel = (northEast, southWest, mapWidth, mapHeight) => {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    const latFraction = (lat) => {
      return (
        (1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) +
              1 / Math.cos((lat * Math.PI) / 180)
          ) /
            Math.PI) /
        2
      );
    };

    const latDiff =
      latFraction(northEast.latitude) - latFraction(southWest.latitude);
    const lngDiff = (northEast.longitude - southWest.longitude) / 360;

    if (latDiff <= 0 || lngDiff <= 0) {
      return ZOOM_MAX; // Retourne le zoom maximum si les différences sont invalides
    }

    const latZoom = Math.log(mapHeight / WORLD_DIM.height / latDiff) / Math.LN2;
    const lngZoom = Math.log(mapWidth / WORLD_DIM.width / lngDiff) / Math.LN2;

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  };

  const getLatLongDelta = (zoom: number, latitude: number): number[] => {
    const LONGITUDE_DELTA = Math.exp(Math.log(360) - zoom * Math.LN2);
    const ONE_LATITUDE_DEGREE_IN_METERS = 111.32 * 1000;
    const accurateRegion =
      LONGITUDE_DELTA *
      (ONE_LATITUDE_DEGREE_IN_METERS * Math.cos(latitude * (Math.PI / 180)));
    const LATITUDE_DELTA = accurateRegion / ONE_LATITUDE_DEGREE_IN_METERS;

    return [LONGITUDE_DELTA, LATITUDE_DELTA];
  };

  const updateCamera = async (center, pourcentage) => {
    const { northEast, southWest } = await mapRef.current.getMapBoundaries();

    if (!northEast || !southWest) {
      console.error("Invalid map boundaries");
      return;
    }

    const latOffset = (northEast.latitude - southWest.latitude) * pourcentage;
    const adjustedLatitude = center.latitude - latOffset;

    const userCoords = {
      latitude: adjustedLatitude,
      longitude: center.longitude,
    };

    await mapRef.current.animateCamera({center:userCoords,zoom:15,pitch:0},350);
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

const styles = StyleSheet.create({});

export default HomeScreen;

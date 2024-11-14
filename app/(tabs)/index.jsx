import React, { useEffect, useRef, useState } from "react";
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
  useWindowDimensions,
  Keyboard,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { ScrollView } from "react-native-gesture-handler";
import * as Location from "expo-location";
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
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import ContactInfo from "../../components/InformationLocation";

const HomeScreen = () => {
  const [state, setState] = useState({
    places: [],
    selectedPlace: null,
    city: null,
    followUser: true,
    parentHeight: 0,
    sliderValue: 1,
    userLocation: null,
    pourcentage: 0,
    tempMarker: null,
    isAddingMarker: false,
    markerForm: {
      name: "",
      type: "",
      rating: 0,
    },
  });
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const SecondRoute = () => (
    <View>
      <Text> test</Text>
    </View>
  );

  const routes = [
    { key: "glimpse", title: "Aperçu" },
    { key: "opinion", title: "Avis" },
  ];
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "glimpse":
        return <ContactInfo selectedPlace={state.selectedPlace} />;
      case "opinion":
        return <SecondRoute />;
      default:
        return null;
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "blue" }}
      style={{ backgroundColor: "white" }}
      inactiveColor="black"
      activeColor="blue"
    />
  );

  const tempMarker = state.tempMarker;
  const isAddingMarker = state.isAddingMarker;
  const markerForm = state.markerForm;

  const mapRef = useRef(null);
  const swipeUpRef = useRef(null);
  const sliderRef = useRef(null);
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const pathName = usePathname();

  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (tempMarker) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [tempMarker]);

  const setAllValues = (newValues) => {
    setState((prevState) => ({
      ...prevState,
      ...newValues,
    }));
  };

  async function queryNearbyPlaces(center, radiusInM) {
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = bounds.map((b) => {
      const q = query(
        collection(db, "places"),
        orderBy("geohash"),
        startAt(b[0]),
        endAt(b[1])
      );
      return getDocs(q);
    });

    const snapshots = await Promise.all(promises);
    const matchingDocs = [];

    snapshots.forEach((snap) => {
      snap.docs.forEach((doc) => {
        const lat = doc.get("location").latitude;
        const lng = doc.get("location").longitude;
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push(doc);
        }
      });
    });

    return matchingDocs;
  }

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("white");
    }
  }, []);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        console.log(event.endCoordinates.height);
        console.log("Clavier ouvert pourcentage", state.pourcentage);
        if (state.pourcentage >= 0.1) {
          swipeUpRef.current?.openAtPosition(event.endCoordinates.height);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        swipeUpRef.current?.openAtLastPosition();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [state.pourcentage]);

  useEffect(() => {
    if (!state.userLocation || !state.followUser) return;
    const center = [state.userLocation.latitude, state.userLocation.longitude];
    const radiusInM = state.sliderValue * 100;

    queryNearbyPlaces(center, radiusInM).then((docs) => {
      const placesData = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllValues({ places: placesData });
    });
  }, [state.userLocation, state.sliderValue]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
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

      setAllValues({ userLocation: userCoords });

      if (mapRef.current) {
        setAllValues({ followUser: false });
        await updateCamera(userCoords, state.pourcentage, 2000);
        setAllValues({ followUser: true });
      }

      const locationDetails = await Location.reverseGeocodeAsync(userCoords);
      if (locationDetails.length > 0) {
        const { city } = locationDetails[0];
        setAllValues({ city });
      }
    })();
  }, []);

  const handleMarkerPress = async (place) => {
    setAllValues({ selectedPlace: place, followUser: false });

    const userCoords = {
      latitude: place.latitude,
      longitude: place.longitude,
    };

    await swipeUpRef?.current?.openAtHalf(2);
    await updateCamera(userCoords, state.pourcentage);
  };

  const handleMapPress = async (e) => {
    setAllValues({ selectedPlace: null, followUser: false });
    if (!e.nativeEvent || !e.nativeEvent.coordinate) return;

    const { latitude, longitude } = e.nativeEvent.coordinate;
    // Vérifier que les coordonnées sont valides
    if (typeof latitude === "number" && typeof longitude === "number") {
      setAllValues({
        tempMarker: { latitude, longitude },
        isAddingMarker: true,
      });
      // setTempMarker({
      //   latitude: parseFloat(latitude),
      //   longitude: parseFloat(longitude),
      // });
      // setIsAddingMarker(true);
    }
    swipeUpRef.current?.openAtHalf(1);
  };
  const handleSwipePositionChange = async (
    newPosition,
    final = false,
    end = false
  ) => {
    console.log("Position", newPosition);
    const maxPosition = -(state.parentHeight * 0.5);
    const targetValue = Math.max(
      -(state.parentHeight - newPosition),
      maxPosition
    );

    Animated.timing(buttonAnim, {
      toValue: targetValue,
      duration: final ? 300 : 0,
      useNativeDriver: false,
    }).start();

    const newPourcentage = (1 - newPosition / state.parentHeight) / 2;
    if (end) {
      let center = { ...state.userLocation };
      if (state.selectedPlace) center = state.selectedPlace.location;

      if (state.followUser || state.selectedPlace)
        updateCamera(center, newPourcentage);
      setAllValues({ pourcentage: newPourcentage });
    }
  };

  const getOffset = (zoom, heading, screenRatio) => {
    const BASE_OFFSET = -0.02 * screenRatio;
    const offset = BASE_OFFSET / Math.pow(2, zoom);
    const radHeading = heading * (Math.PI / 180);

    const offsetLatitude = offset * Math.cos(radHeading);
    const offsetLongitude = offset * Math.sin(radHeading);

    return {
      offsetLatitude: +offsetLatitude,
      offsetLongitude: +offsetLongitude,
    };
  };

  const updateCamera = async (center, pourcentage, altitude) => {
    if (!mapRef.current) {
      console.error("Map reference is not available yet.");
      return;
    }

    const { offsetLatitude, offsetLongitude } = getOffset(
      Platform.OS === "ios" ? 3 : 3,
      0,
      state.parentHeight / 1920
    );

    let adjustedLatitude = center.latitude;
    let adjustedLongitude = center.longitude;
    if (pourcentage >= 0.1) {
      adjustedLatitude += offsetLatitude;
      adjustedLongitude += offsetLongitude;
    }

    const userCoords = {
      latitude: adjustedLatitude,
      longitude: adjustedLongitude,
      latitudeDelta: 0.0043,
      longitudeDelta: 0.0034,
    };

    await mapRef.current.animateToRegion(userCoords, 350);
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
    };

    if (mapRef.current) {
      await updateCamera(userCoords, state.pourcentage);
      setAllValues({
        userLocation: userCoords,
        selectedPlace: null,
        followUser: true,
      });
    }
  };

  const handleUserLocationChange = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setAllValues({ userLocation: { latitude, longitude } });

    if (state.followUser) {
      const center = { latitude, longitude };
      await updateCamera(
        center,
        state.pourcentage >= 0.1 ? state.pourcentage : 0
      );
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
          onPress={handleMapPress}
          showsIndoors={false}
          showsTraffic={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          onTouchStart={() => setAllValues({ followUser: false })}
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
          {tempMarker && tempMarker.latitude && tempMarker.longitude && (
            <Marker.Animated
              coordinate={{
                latitude: tempMarker.latitude,
                longitude: tempMarker.longitude,
              }}
              opacity={blinkAnim}
              tracksViewChanges={false}
            >
              <FontAwesome6
                name={getIconByType(markerForm.type)}
                size={24}
                color="#4A4A4A"
              />
            </Marker.Animated>
          )}
        </MapView>
        <Animated.View
          style={{ transform: [{ translateY: buttonAnim }], zIndex: 3 }}
        >
          {!state.followUser && (
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
          positions={[10, 35, 50, 100]}
        >
          <View className="h-1 w-20 bg-gray-300 rounded-full self-center mb-2 top-1" />
          {state.selectedPlace ? (
            // Condition 1 : Place sélectionnée
            <>
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
              />
              <Text className="text-gray-700 font-semibold top-3 text-xl">
                {state.selectedPlace.name}
              </Text>
              <Text className="text-gray-500">
                {state.selectedPlace.description}
              </Text>
            </>
          ) : isAddingMarker ? (
            // Condition 2 : Ajout d'un marker
            <View className="">
              <Text className="text-gray-700 font-semibold text-xl text-center">
                Ajouter un lieu
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2 mt-4"
                placeholder={markerForm.placeholder}
                value={markerForm.name}
                onChangeText={
                  (text) =>
                    setAllValues({
                      markerForm: { ...markerForm, name: text },
                    })
                  //setMarkerForm({ ...markerForm, name: text })
                }
              />

              <ScrollView
                horizontal
                className="flex flex-row mt-4 mb-2 h-16"
                showsHorizontalScrollIndicator
              >
                {[
                  "Tourism",
                  "Museum",
                  "Cinema",
                  "Theater",
                  "Park",
                  "Education",
                  "Jedi",
                ].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      setAllValues({ markerForm: { ...markerForm, type } })
                    }
                    //setMarkerForm({ ...markerForm, type })}
                    className={`
        mx-2 w-12 h-12 rounded-full border border-gray-300
        flex items-center justify-center
        ${markerForm.type === type ? "bg-gray-100 border-[#DDC97A]" : ""}
      `}
                  >
                    <FontAwesome6
                      name={getIconByType(type)}
                      size={17}
                      color="#4A4A4A"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Button
                title="Ajouter"
                onPress={() => {
                  setAllValues({
                    isAddingMarker: false,
                    MarkerForm: {
                      name: "",
                      placeholder: "Nom de votre Adresse",
                      type: "",
                      rating: 0,
                    },
                    tempMarker: null,
                  });
                  swipeUpRef.current?.openAtHalf(0);
                }}
              />
            </View>
          ) : (
            // État par défaut : Liste des nouveautés
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
                    <View style={styles.placeCard}>
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

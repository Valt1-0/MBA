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
  Image,
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
import {
  getIconByType,
  queryNearbyPlaces,
  addPlace,
} from "../../utils/functions";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeUp from "../../components/SwipeUp";
import { customMapStyle } from "../../utils/customMap";
import * as NavigationBar from "expo-navigation-bar";
import { useSegments, usePathname } from "expo-router";
import RangeSlider from "../../components/Slider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import ContactInfo from "../../components/InformationLocation";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "expo-router";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import CommentLocation from "../../components/CommentLocation";
import { getDistance } from "geolib";
import * as ImagePicker from "expo-image-picker";

const HomeScreen = () => {
  const [state, setState] = useState({
    places: [],
    selectedPlace: null,
    city: null,
    followUser: true,
    parentHeight: 0,
    sliderValue: 20,
    userLocation: null,
    pourcentage: 0,
    tempMarker: null,
    isAddingMarker: false,
    markerForm: {
      name: "",
      description: "",
      type: "",
      rating: 0,
    },
    index: 0,
    lastQueryLocation: null,
    lastQueryTimestamp: null,
  });
  const { userInfo, isAuthenticated } = React.useContext(UserContext);
  const router = useRouter();

  const layout = useWindowDimensions();
  const index = state.index;
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
        return <CommentLocation id={state?.selectedPlace?.id} />;
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
  const blinkAnim = useRef(new Animated.Value(1)).current;

  const mapRef = useRef(null);
  const swipeUpRef = useRef(null);
  const sliderRef = useRef(null);
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const pathName = usePathname();

  const [visibilityMessage, setVisibilityMessage] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState([]);

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

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("white");
    }
  }, []);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        if (state.pourcentage >= 0.1 && Platform.OS === "ios") {
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
    if (!state.userLocation) return;

    // Vérifier si c'est la première requête
    if (!state.lastQueryTimestamp || !state.lastQueryLocation) {
      performQuery();
      return;
    }

    // Vérifier le délai (30 secondes)
    const now = Date.now();
    const timeSinceLastQuery = now - state.lastQueryTimestamp;
    const MIN_DELAY = 60000; // 30 secondes en millisecondes

    if (timeSinceLastQuery < MIN_DELAY) {
      console.log("Délai minimum non atteint");
      return;
    }

    // Calculer la distance depuis la dernière requête
    const distance = getDistance(
      {
        latitude: state.lastQueryLocation.latitude,
        longitude: state.lastQueryLocation.longitude,
      },
      {
        latitude: state.userLocation.latitude,
        longitude: state.userLocation.longitude,
      }
    );

    // Si la distance est supérieure à 400m, faire la requête
    if (distance > 400) {
      performQuery();
    }
  }, [state.userLocation, state.sliderValue]);

  // Modifier la fonction performQuery
  const performQuery = async () => {
    try {
      console.log("Performing query...");
      const center = [
        state.userLocation.latitude,
        state.userLocation.longitude,
      ];
      const radiusInM = state.sliderValue * 100;

      const docs = await queryNearbyPlaces(center, radiusInM);
      const placesData = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllValues({
        places: placesData,
        lastQueryLocation: state.userLocation,
        lastQueryTimestamp: Date.now(),
      });
    } catch (error) {
      // Mise à jour du timestamp même en cas d'erreur
      setAllValues({
        lastQueryLocation: state.userLocation,
        lastQueryTimestamp: Date.now(),
      });

      if (error.message.includes("quota exceeded")) {
        console.log("Quota exceeded, waiting for next window...");
      } else {
        console.error("Query error:", error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      const { status: imagePickerStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (imagePickerStatus !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de votre permission pour accéder à vos photos"
        );
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
      latitude: place?.latitude,
      longitude: place?.longitude,
    };

    await swipeUpRef?.current?.openAtHalf(2);
    await updateCamera(userCoords, state.pourcentage);
  };

  const handleMapPress = async (e) => {
    setAllValues({ selectedPlace: null, followUser: false });
    console.log(e.nativeEvent);
    if (!e.nativeEvent || !e.nativeEvent?.coordinate) return;

    const { latitude, longitude } = e.nativeEvent.coordinate;
    // Vérifier que les coordonnées sont valides
    if (typeof latitude === "number" && typeof longitude === "number") {
      setAllValues({
        tempMarker: { latitude, longitude },
        isAddingMarker: true,
      });
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
    if (!event.nativeEvent?.coordinate) return;
    const { latitude, longitude } = event.nativeEvent?.coordinate;
    setAllValues({ userLocation: { latitude, longitude } });

    if (state.followUser) {
      const center = { latitude, longitude };
      await updateCamera(
        center,
        state.pourcentage >= 0.1 ? state.pourcentage : 0
      );
    }
  };

  const handleAddPlace = async () => {
    try {
      if (!isAuthenticated) {
        router.push("/auth");
        return;
      }

      const placeData = {
        name: markerForm.name,
        type: markerForm.type,
        description: markerForm.description,
        images: markerForm.images,
        rating: markerForm.rating,
        isPublic: markerForm.isPublic,
        latitude: tempMarker.latitude,
        longitude: tempMarker.longitude,
      };

      const result = await addPlace(placeData, userInfo);

      if (result.success) {
        // Reset form et fermer le swipe up
        setAllValues({
          isAddingMarker: false,
          markerForm: {
            name: "",
            description: "",
            type: "", // Reset du type
            rating: 0,
            images: [],
            isPublic: true,
          },
          tempMarker: null,
        });

        placeData.id = result.id;

        setAllValues({ places: [...state.places, placeData] });

        swipeUpRef.current?.openAtHalf(0);
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  // Fonction pour convertir en base64
  const imageToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const pickImages = async () => {
    try {
      // Correction du type mediaTypes
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        const processedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const base64 = await imageToBase64(asset.uri);
            return {
              uri: asset.uri,
              base64: base64,
            };
          })
        );

        setAllValues({
          markerForm: {
            ...markerForm,
            images: [...(markerForm.images || []), ...processedImages],
          },
        });
      }
    } catch (error) {
      console.error("Erreur sélection images:", error);
      Alert.alert("Erreur", "Impossible de charger les images sélectionnées");
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
          onLongPress={(e) => handleMapPress(e)}
          customMapStyle={customMapStyle}
          style={{ width: "100%", height: "100%" }}
          followsUserLocation={false}
          showsUserLocation={true}
          showsIndoors={false}
          showsTraffic={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          onTouchStart={() => {
            sliderRef.current?.close();
            setAllValues({ followUser: false });
          }}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          onUserLocationChange={handleUserLocationChange}
          loadingEnabled={true}
        >
          {state.places.map((place) => {
            if (!place?.latitude || !place?.longitude) return null;
            return (
              <Marker
                key={place.id}
                tracksViewChanges={false}
                coordinate={{
                  latitude: place?.latitude,
                  longitude: place?.longitude,
                }}
                onPress={(e) => {
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
            );
          })}
          {tempMarker && tempMarker?.latitude && tempMarker?.longitude && (
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
        <Animated.View style={{ transform: [{ translateY: buttonAnim }] }}>
          {!state.followUser && (
            <TouchableOpacity
              className="absolute bottom-10 left-5 "
              onPress={(e) => {
                handleMyLocationPress();
              }}
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
                onIndexChange={(NewIndex) => setAllValues({ index: NewIndex })}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
              />
            </>
          ) : isAddingMarker ? (
            isAuthenticated ? (
              // Condition 2 : Ajout d'un marker
              <View className="top-4">
                <View className="flex flex-row items-center justify-between px-4">
                  <TouchableOpacity className="flex items-center justify-center w-8 h-8 border border-[#cc514a] rounded-lg">
                    <FontAwesome6
                      name="trash"
                      size={17}
                      color="#cc514a"
                      onPress={() => {
                        setAllValues({
                          isAddingMarker: false,
                          MarkerForm: {
                            type: "",
                            rating: 0,
                          },
                          tempMarker: null,
                        });
                        swipeUpRef.current?.openAtHalf(0);
                      }}
                    />
                  </TouchableOpacity>

                  <Text className="text-gray-700 font-semibold text-xl">
                    Ajouter un lieu
                  </Text>

                  <TouchableOpacity className="flex items-center justify-center w-8 h-8 border border-[#4ACC4A] rounded-lg">
                    <FontAwesome6
                      name="check"
                      size={17}
                      color="#4ACC4A"
                      onPress={() => {
                        handleAddPlace();
                      }}
                    />
                  </TouchableOpacity>
                </View>
                <TextInput
                  className="border border-gray-300 rounded-lg text-lg p-2 mt-4 mx-10 text-center"
                  placeholder="Nom de votre Adresse"
                  value={markerForm.name}
                  onChangeText={(text) =>
                    setAllValues({
                      markerForm: { ...markerForm, name: text },
                    })
                  }
                />
                <TextInput
                  className="border border-gray-300 rounded-lg text-lg p-2 mt-4 mx-10 text-center"
                  placeholder="Description de votre Adresse"
                  multiline
                  numberOfLines={3}
                  value={markerForm.description}
                  onChangeText={(text) =>
                    setAllValues({
                      markerForm: { ...markerForm, description: text },
                    })
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
                        setAllValues({
                          markerForm: { ...markerForm, type: type },
                        })
                      }
                      className={`mx-2 w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center ${
                        markerForm.type === type
                          ? "bg-gray-100 border-[#DDC97A]"
                          : ""
                      }`}
                    >
                      <FontAwesome6
                        name={getIconByType(type)}
                        size={17}
                        color="#4A4A4A"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View className="flex flex-row items-center justify-center mt-1">
                  <View className="relative w-16 flex items-center justify-center">
                    <TouchableOpacity
                      onPress={() => {
                        setAllValues({
                          markerForm: {
                            ...markerForm,
                            isPublic: !markerForm.isPublic,
                          },
                        });
                        setVisibilityMessage(
                          markerForm.isPublic ? "Privé" : "Public"
                        );
                        setTimeout(() => setVisibilityMessage(null), 2000);
                      }}
                    >
                      <View className="h-8 flex items-center justify-center">
                        <FontAwesome6
                          name={markerForm.isPublic ? "eye" : "eye-slash"}
                          size={17}
                          color="#4A4A4A"
                        />
                      </View>
                    </TouchableOpacity>
                    {visibilityMessage && (
                      <Text className="absolute top-8 text-xs text-gray-600 w-full text-center">
                        {visibilityMessage}
                      </Text>
                    )}
                  </View>

                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() =>
                        setAllValues({
                          markerForm: { ...markerForm, rating: star },
                        })
                      }
                      className="mx-3"
                    >
                      <FontAwesome6
                        name={star <= markerForm.rating ? "star" : "star"}
                        size={24}
                        color={
                          star <= markerForm.rating ? "#DDC97A" : "#9CA3AF"
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  className="bg-[#DDC97A] p-3 rounded-lg flex-row items-center justify-center top-8 mx-10"
                  onPress={pickImages}
                >
                  <FontAwesome6
                    name="image"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white font-semibold">
                    Sélectionner des photos
                  </Text>
                </TouchableOpacity>
                {markerForm.images && markerForm.images.length > 0 && (
                  <ScrollView
                    horizontal
                    className="top-10 px-10"
                    showsHorizontalScrollIndicator={false}
                  >
                    {markerForm.images.map((img, index) => (
                      <View
                        key={index}
                        className="relative mr-3 shadow-sm mt-3"
                      >
                        <Image
                          source={{ uri: img.uri }}
                          className="w-24 h-24 rounded-xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          className="absolute -top-3 -right-3 bg-red-500 w-7 h-7 rounded-full items-center justify-center shadow-sm"
                          onPress={() => {
                            const newImages = [...markerForm.images];
                            newImages.splice(index, 1);
                            setAllValues({
                              markerForm: { ...markerForm, images: newImages },
                            });
                          }}
                        >
                          <FontAwesome6 name="trash" size={12} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : (
              <View className="flex items-center justify-center p-6">
                <Text className="text-gray-700 font-semibold text-xl text-center mb-4">
                  Veuillez vous connecter pour ajouter une Adresse
                </Text>
                <TouchableOpacity
                  className="bg-[#DDC97A] px-6 py-3 rounded-lg flex-row items-center"
                  onPress={() => {
                    setAllValues({
                      isAddingMarker: false,
                      tempMarker: null,
                    });
                    router.push("/auth");
                  }}
                >
                  <FontAwesome6
                    name="arrow-right-to-bracket"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white font-semibold text-lg">
                    Se connecter
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            // État par défaut : Liste des nouveautés
            <>
              <Text className="text-gray-700 font-semibold top-3 text-xl">
                Nouveautés à {state.city}
              </Text>
            </>
          )}
        </SwipeUp>
      </View>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;

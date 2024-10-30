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
import { FontAwesome, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getColorByType, getIconByType } from "../../utils/functions";
import { db } from "../../utils/firebase";
import { collection, getDocs,query ,orderBy,startAt,endAt} from "firebase/firestore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeUp from "../../components/SwipeUp";
import { customMapStyle } from "../../utils/customMap";
import { geohashQueryBounds, distanceBetween } from "geofire-common";


const HomeScreen = () => {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [city, setCity] = useState(null);
  const mapRef = useRef(null);
  const [followUser, setFollowUser] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [parentHeight, setParentHeight] = useState(0);
 
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
 











  // useEffect(() => {
  //   const fetchPlaces = async () => {
  //     const placesCollection = collection(db, "places");
  //     const placesSnapshot = await getDocs(placesCollection);
  //     const placesList = placesSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setPlaces(placesList);
  //   };
  //   console.log("Fetching places...");

  //   fetchPlaces();
  // }, []);

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

      const center = [userCoords.latitude, userCoords.longitude];
      const radiusInM = 1000; // Rayon en mètres

         queryNearbyPlaces(center, radiusInM).then((docs) => {
           const placesData = docs.map((doc) => ({
             id: doc.id,
             ...doc.data(),
           }));
           setPlaces(placesData);
         });

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
    setPanelOpen(true);
  };
  const handleMapPress = () => { 
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
          showsMyLocationButton={true}
          showsPointsOfInterest={false}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              tracksViewChanges = {false}
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
        {Platform.OS === "ios" && !followUser && (
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
          openAtHalf={panelOpen}
          parentHeight={parentHeight}
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

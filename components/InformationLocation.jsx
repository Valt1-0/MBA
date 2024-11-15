import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { deletePlace } from "../utils/functions"; // Assurez-vous d'importer la fonction deletePlace
import { UserContext } from "../context/UserContext";

export default function ContactInfo({ selectedPlace }) {
  const [address, setAddress] = useState("");
  const { userInfo } = useContext(UserContext);

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

  return (
    <View style={styles.container}>
      {/* Adresse */}
      <View style={styles.row}>
        <FontAwesome name="map-marker" size={24} color="blue" />
        <Text style={styles.text}>{address}</Text>
      </View>

      {/* Horaires */}
      {selectedPlace.hourly && (
        <View style={styles.row}>
          <FontAwesome name="clock-o" size={24} color="blue" />
          <Text style={styles.text}>
            <Text style={styles.openText}>Ouvert</Text> • Ferme à 18:30
          </Text>
        </View>
      )}

      {/* Site web */}
      {selectedPlace.WebSite && (
        <View style={styles.row}>
          <FontAwesome name="globe" size={24} color="blue" />
          <TouchableOpacity onPress={() => console.log("Ouvrir le site web")}>
            <Text style={styles.linkText}>{selectedPlace.WebSite}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Description */}
      <View style={styles.row}>
        <FontAwesome name="info" size={24} color="blue" />
        <Text style={styles.text}>{selectedPlace.description}</Text>
      </View>

      {/* Suggérer une modification */}
      <View style={styles.row}>
        <FontAwesome name="pencil" size={24} color="blue" />
        <TouchableOpacity
          onPress={() => console.log("Suggérer une modification")}
        >
          <Text style={styles.text}>Suggérer une modif.</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton Supprimer */}
      {userInfo?.uid === selectedPlace?.createdBy?.uid && (
        <View style={styles.row}>
          <FontAwesome name="trash" size={24} color="red" />
          <TouchableOpacity onPress={handleDelete}>
            <Text style={[styles.text, { color: "red" }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginLeft: 8,
  },
  openText: {
    color: "green",
    fontWeight: "bold",
  },
  linkText: {
    fontSize: 16,
    color: "blue",
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  seeMore: {
    marginTop: 16,
    alignItems: "center",
  },
  seeMoreText: {
    fontSize: 16,
    color: "blue",
  },
});

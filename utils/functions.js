import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
  addDoc,
  deleteDoc,
  doc,
  GeoPoint
} from "firebase/firestore";
import {
  geohashQueryBounds,
  distanceBetween,
  geohashForLocation,
} from "geofire-common";

// Fonction pour déterminer la couleur selon le type de lieu
const getColorByType = (type) => {
  switch (type) {
    case "Tourism":
      return "red";
    case "Museum":
      return "blue";
    case "Cinema":
      return "yellow";
    case "Theater":
      return "green";
    case "Park":
      return "brown";
    case "Education":
      return "aqua";
    default:
      return "gray"; // Couleur par défaut
  }
};

const getIconByType = (type) => {
  switch (type) {
    case "Tourism":
      return "person-walking";
    case "Museum":
      return "building-columns";
    case "Cinema":
      return "film";
    case "Theater":
      return "masks-theater";
    case "Park":
      return "tree";
    case "Education":
      return "graduation-cap";
    case "Jedi":
      return "jedi";
    default:
      return "map-pin"; // Icône par défaut
  }
};

/* FIREBASE */
/* Fonction pour obtenir les lieux à proximité */
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
/* Fonction pour ajouter un lieu */
async function addPlace(place, userInfo) {
  try {
    console.log("place : " + JSON.stringify(place.type));

    // Validation des données requises
    if (!place.name || !place.type || !place.latitude || !place.longitude) {
      throw new Error("Informations manquantes");
    }

    // Validation du rating
    if (place.rating < 0 || place.rating > 5) {
      throw new Error("Note invalide");
    }

    // Création du geohash pour la recherche géographique
    const geohash = geohashForLocation([place.latitude, place.longitude]);

    console.log("place : " + place);

    // Structure des données à envoyer
    const placeData = {
      name: place.name.trim(),
      type: place.type,
      description: place.description || "",
      images: place.images || [],
      rating: place.rating,
      isPublic: place.isPublic ?? true,
      createdAt: new Date().toISOString(),
      createdBy: {
        uid: userInfo.uid,
        displayName: userInfo.displayName || "Anonyme",
      },
      location: new GeoPoint(place.latitude, place.longitude),
      latitude: place.latitude,
      longitude: place.longitude,
      geohash,
    };

    // Envoi à Firebase
    const docRef = await addDoc(collection(db, "places"), placeData);

    return {
      success: true,
      id: docRef.id,
      message: "Lieu ajouté avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du lieu:", error);
    throw {
      success: false,
      error: error.message || "Erreur lors de l'ajout du lieu",
    };
  }
}

async function deletePlace(placeId) {
  try {
    // Supprimer le lieu de la collection "places"
    await deleteDoc(doc(db, "places", placeId));
    return {
      success: true,
      message: "Lieu supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du lieu:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la suppression du lieu",
    };
  }
}

export {
  getColorByType,
  getIconByType,
  queryNearbyPlaces,
  addPlace,
  deletePlace,
};

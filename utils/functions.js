import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { geohashQueryBounds, distanceBetween } from "geofire-common";

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
async function addPlace(place) {
  // Ajouter le lieu à la collection "places"
  await addDoc(collection(db, "places"), place);
}

/* Fonction pour supprimer un lieu */
async function deletePlace(placeId) {
  // Supprimer le lieu de la collection "places"
  await deleteDoc(doc(db, "places", placeId));
}

export { getColorByType, getIconByType, queryNearbyPlaces };

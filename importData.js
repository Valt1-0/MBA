const admin = require("firebase-admin");
const serviceAccount = require("./data/admin-key.json");
const { geohashForLocation } = require("geofire-common");

// Initialiser l'application Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
});

const firestore = admin.firestore();

// Chemin vers votre fichier JSON
const data = require("./data/places.json");

// Fonction pour importer les données dans Firestore
async function importData() {
  const collectionRef = firestore.collection("places");

  const batch = firestore.batch();

  data.forEach((item) => {
    const docRef = collectionRef.doc(); // Utiliser l'ID du document fourni
    const geohash = geohashForLocation([item.latitude, item.longitude]);
    batch.set(docRef, {
      ...item,
      geohash,
      location: new admin.firestore.GeoPoint(item.latitude, item.longitude),
    });
  });

  await batch.commit();
  console.log("Data imported successfully!");
}

importData().catch(console.error);

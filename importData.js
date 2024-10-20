const admin = require("firebase-admin");
const serviceAccount = require("./data/admin-key.json");

// Initialiser l'application Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// Chemin vers votre fichier JSON
const data = require("./data/places.json");

// Fonction pour importer les données dans Firestore
async function importData() {
  const collectionRef = firestore.collection("places");

  const batch = firestore.batch();

  data.forEach((item) => {
    const docRef = collectionRef.doc(); // Crée un nouveau document avec un ID unique
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log("Data imported successfully!");
}

importData();

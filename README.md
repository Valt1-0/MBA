# Mes Bonnes Adresses

Une application mobile permettant aux utilisateurs de créer et partager des lieux d'intérêt sur une carte interactive.

## 🚀 Technologies

- React Native / Expo
- NodeJS (20.18)
- Firebase (Authentication, Firestore, Storage)
- NativeWind (TailwindCSS)
- GeoFire
- OpenRouteService

## ✨ Fonctionnalités

- 📍 Création de points d'intérêt personnalisés
- 🌍 Visualisation des lieux sur une carte interactive
- 🔍 Recherche de lieux à proximité
- ⭐ Système de notation
- 👥 Partage public/privé des lieux
- 🎯 Géolocalisation en temps réel
- 🔐 Authentification utilisateur

## 📱 Installation

```bash
# Cloner le projet
git clone https://github.com/Valt1-0/MBA.git

# Installer les dépendances
cd MBA
npm install

```

## 🔥 Obtenir les clés Firebase

### Étapes d'inscription

1. Rendez-vous sur [Firebase Console](https://console.firebase.google.com)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet et suivez les étapes de configuration

### Configuration du projet

1. Dans le menu latéral, cliquez sur l'icône ⚙️ (Paramètres) > "Paramètres du projet"
2. Dans la section "Vos applications", cliquez sur l'icône web (</>)
3. Enregistrez votre application avec un nom
4. Copiez la configuration Firebase qui apparaît

### Activation des services

1. **Authentication**

   - Dans le menu latéral, cliquez sur "Authentication"
   - Dans "Sign-in method", activez "Email/Mot de passe"

2. **Firestore Database**
   - Dans le menu latéral, cliquez sur "Firestore Database"
   - Cliquez sur "Créer une base de données"
   - Choisissez le mode "production" ou "test"
   - Sélectionnez la région la plus proche

### Configuration

Ajoutez les clés dans votre fichier `.env` :

```bash
EXPO_PUBLIC_FIREBASE_API_KEY="votre-api-key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="votre-auth-domain"
EXPO_PUBLIC_DATABASE_URL="votre-database-url"
EXPO_PUBLIC_PROJECT_ID="votre-project-id"
EXPO_PUBLIC_STORAGE_BUCKET="votre-storage-bucket"
EXPO_PUBLIC_MESSAGING_SENDER_ID="votre-messaging-sender-id"
EXPO_PUBLIC_APP_ID="votre-app-id"
EXPO_PUBLIC_MEASUREMENT_ID="votre-measurement-id"
```

⚠️ Plan gratuit Firebase (Spark) :
- 1GB de stockage
- 10GB/mois de transfert
- 50K écritures/jour
- 50K lectures/jour

## 🗺️ Obtenir une clé API OpenRouteService

### Étapes d'inscription

1. Rendez-vous sur [OpenRouteService](https://openrouteservice.org)
2. Cliquez sur "Sign Up" pour créer un compte
3. Confirmez votre adresse email

### Obtenir la clé API

1. Connectez-vous à votre compte
2. Accédez au [Dashboard](https://openrouteservice.org/dev/#/home)
3. Dans la section "Token", cliquez sur "Create Token"
4. Remplissez le formulaire :
   - Nom du token (ex: "MBA App")
   - Sélectionnez les services nécessaires :
     - ✅ Directions
     - ✅ Geocoding
     - ✅ Places
5. Copiez la clé API générée

### Configuration

Ajoutez la clé dans votre fichier `.env` :

```bash
EXPO_PUBLIC_OPEN_ROUTE_SERVICE_API_KEY="votre-clé-api"
```

⚠️ Limitations gratuites :

- 2000 requêtes/jour
- 40 requêtes/minute

# Lancer l'application

```
npx expo start -c
```

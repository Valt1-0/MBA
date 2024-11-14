import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons"; // Importer les icônes
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserContext } from "../../context/UserContext";
import { useFocusEffect, useRouter } from "expo-router";
import { getAuth, updateProfile, signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile() {
  const [activeButton, setActiveButton] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const { userInfo, setUser } = useContext(UserContext);
  const [displayName, setDisplayName] = useState(userInfo?.displayName || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [password, setPassword] = useState("");
  const auth = getAuth();
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (!userInfo?.isAuthenticated) {
      router.replace("/auth");
    }
  }, [userInfo]);

  const handleUpdate = () => {
    // Logic to update user information
    console.log("User information updated:", { displayName, email, password });
    // Update the user context
    updateProfile(auth.currentUser, {
      displayName: displayName,
      photoURL: avatar,
    })
      .then(() => {
        // Profile updated!
        console.log("Profile updated!");
      })
      .catch((error) => {
        // An error occurred
        console.error("Error updating profile:", error);
      });
    setUser({ ...userInfo, displayName, email, photoURL: avatar });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setUser(null);
      })
      .catch((error) => {
        // An error happened.
        console.error("Error signing out:", error);
      });
  };

  const pickImage = async () => {
    // Demander la permission d'accès à la galerie
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Désolé, nous avons besoin de la permission d'accès à la galerie pour cela !"
      );
      return;
    }

    // Ouvrir la galerie pour sélectionner une image
    let result = await ImagePicker.launchImageLibraryAsync({ 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const source = { uri: result.assets[0].uri };
      setAvatar(source.uri);
      uploadImage(source.uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    setAvatar(downloadURL);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.form}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              avatar
                ? { uri: avatar }
                : require("../../assets/avatar-placeholder.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.changeAvatarText}>Changer d'avatar</Text>
        </TouchableOpacity>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Name:</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password: </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <Button title="Update" onPress={handleUpdate} />
        <Button title="Sign Out" onPress={handleSignOut} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  changeAvatarText: {
    textAlign: "center",
    color: "#007BFF",
    marginBottom: 20,
  },
});

import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons"; // Importer les icônes
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserContext } from "../../context/UserContext";
import { useFocusEffect, useRouter } from "expo-router";
import { getAuth, updateProfile, signOut } from "firebase/auth";

export default function Profile() {
  const [activeButton, setActiveButton] = useState(null);

  const { userInfo, setUser } = useContext(UserContext);
  const [displayName, setDisplayName] = useState(userInfo?.displayName || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [password, setPassword] = useState("");
  const auth = getAuth();
  const router = useRouter();

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
    })
      .then(() => {
        // Profile updated!
        console.log("Profile updated!");
      })
      .catch((error) => {
        // An error occurred
        console.error("Error updating profile:", error);
      });
    setUser({ ...userInfo, displayName, email });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setUser(null);

        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: 0,
        //     routes: [{ name: "Auth" }],
        //   })
        // );

        //navigation.navigate("Profile");
      })
      .catch((error) => {
        // An error happened.
        console.error("Error signing out:", error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.form}>
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
});

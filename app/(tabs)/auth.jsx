import React, { useEffect, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { UserContext } from "../../context/UserContext";
import { useFocusEffect, useRouter, useSegments } from "expo-router";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const { setUser, userInfo } = React.useContext(UserContext);
  const auth = getAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => { 
    if (userInfo) {
      router.replace("/profile");
    }
  }, [userInfo]);

  // useFocusEffect(() => {
  //   if (userInfo) {
  //     router.replace("/profile");
  //   }
  // });

  const handleAuth = () => {
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setUser(userCredential.user);
          setSuccess("Account created successfully!");
          setError("");
        })
        .catch((error) => {
          setError(error.message);
          setSuccess("");
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setUser(userCredential.user);
          setSuccess("Logged in successfully!");
          setError("");
          console.log(userCredential.user?.email);
        })
        .catch((error) => {
          setError(error.message);
          setSuccess("");
        });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isSignUp ? "Sign Up" : "Log In"} onPress={handleAuth} />
      <Button
        title={isSignUp ? "Switch to Log In" : "Switch to Sign Up"}
        onPress={() => setIsSignUp(!isSignUp)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  success: {
    color: "green",
    marginTop: 10,
  },
});

export default AuthScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { auth } from "../../utils/firebase";
import { UserContext } from "../../context/UserContext";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setUser, userInfo } = React.useContext(UserContext);

  const router = useRouter();
  const segments = useSegments();

  // Dans handleAuth
  const handleAuth = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!email || !password) {
        throw new Error("Veuillez remplir tous les champs");
      }

      if (!email.includes("@")) {
        throw new Error("Email invalide");
      }

      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      if (isSignUp) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          setUser(userCredential.user);
          setSuccess("Compte créé avec succès!");
          router.push("/profile");
        } catch (error) {
          setError(error.message);
          return;
        }
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          setUser(userCredential.user);
          setSuccess("Connexion réussie!");
          router.push("/profile"); // Redirection vers profile
        } catch (error) {
          setError(error.message);
          return;
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold text-center mb-8">
          {isSignUp ? "Créer un compte" : "Connexion"}
        </Text>

        {error && (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}

        {success && (
          <Text className="text-green-500 text-center mb-4">{success}</Text>
        )}

        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="relative">
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-6 pr-12"
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable
            className="absolute right-4 top-3"
            onPress={() => setShowPassword(!showPassword)}
          >
            <FontAwesome6
              name={showPassword ? "eye-slash" : "eye"}
              size={20}
              color="#666"
            />
          </Pressable>
        </View>

        <Pressable
          className={`rounded-lg p-4 ${
            loading ? "bg-gray-400" : "bg-[#DDC97A]"
          }`}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">
              {isSignUp ? "Créer un compte" : "Se connecter"}
            </Text>
          )}
        </Pressable>

        <Pressable className="mt-4" onPress={() => setIsSignUp(!isSignUp)}>
          <Text className="text-[#DDC97A] text-center">
            {isSignUp ? "Déjà inscrit ? Se connecter" : "Créer un compte"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default AuthScreen;

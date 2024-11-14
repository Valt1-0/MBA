import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { UserContext } from "../../context/UserContext";
import { useFocusEffect, useRouter, useSegments } from "expo-router";

// import { FontAwesome6 } from "@expo/vector-icons";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const { setUser, userInfo } = React.useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (userInfo) {
      router.replace("/profile");
    }
  }, [userInfo]);

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

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAuthMode = () => {
    setIsLogin(!isLogin);
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

    // <View className="flex justify-center items-center h-screen m-auto">
    //   <View className="items-center mb-8">
    //     <Text className="text-[#DDC97A] text-4xl text-center mt-4">
    //       Bienvenue
    //     </Text>
    //   </View>

    //   <View className="w-80">
    //     <Text className="mb-2">Email</Text>
    //     <TextInput
    //       className="border border-gray-300 p-2 rounded-lg mb-4"
    //       placeholder="Entrer votre email"
    //       value={email}
    //       onChangeText={setEmail}
    //       keyboardType="default"
    //       autoComplete="email"
    //       autoCapitalize="none"
    //       inputMode="email"
    //     />

    //     <Text className="mb-2">Mot de Passe</Text>
    //     <View className="relative">
    //       <TextInput
    //         className="border border-gray-300 p-2 rounded-lg mb-4"
    //         placeholder="Entrer votre mot de passe"
    //         value={password}
    //         onChangeText={setPassword}
    //         keyboardType="default"
    //         secureTextEntry={!showPassword}
    //         autoComplete="password"
    //       />
    //       <Pressable
    //         className="absolute right-2 top-3"
    //         onPress={handleTogglePasswordVisibility}
    //       >
    //         <FontAwesome6
    //           library="Entypo"
    //           name={showPassword ? "lock-open" : "lock"}
    //           size={18}
    //           style={{ color: "#DDC97A" }}
    //         />
    //       </Pressable>
    //     </View>

    //     {!isLogin && (
    //       <>
    //         <Text className="mb-2">Confirmer le Mot de Passe</Text>
    //         <View className="relative">
    //           <TextInput
    //             className="border border-gray-300 p-2 rounded-lg mb-4"
    //             placeholder="Confirmer votre mot de passe"
    //             value={confirmPassword}
    //             onChangeText={setConfirmPassword}
    //             keyboardType="default"
    //             secureTextEntry={!showConfirmPassword}
    //             autoComplete="password"
    //           />
    //           <Pressable
    //             className="absolute right-2 top-3"
    //             onPress={handleToggleConfirmPasswordVisibility}
    //           >
    //             <IconComponent
    //               library="Entypo"
    //               name={showConfirmPassword ? "lock-open" : "lock"}
    //               size={18}
    //               style={{ color: "#DDC97A" }}
    //             />
    //           </Pressable>
    //         </View>
    //       </>
    //     )}
    //   </View>

    //   <Pressable
    //     className="bg-[#DDC97A] w-80 p-4 rounded-full mt-4"
    //     onPress={isLogin ? handleLogin : handleRegister}
    //   >
    //     <Text className="text-white text-center">
    //       {isLogin ? "Connexion" : "Inscription"}
    //     </Text>
    //   </Pressable>

    //   {isLogin ? (
    //     <Pressable className="mt-10">
    //       <Text className="text-[#DDC97A] text-center">
    //         Mot de passe oublié ?
    //       </Text>
    //     </Pressable>
    //   ) : null}

    //   <Pressable
    //     className="mt-4 flex-row justify-center items-center"
    //     onPress={handleAuthMode}
    //   >
    //     <Text className="text-slate-500 text-sm">
    //       {isLogin ? "Vous ne possédez pas de compte ?" : "Déjà un compte ?"}
    //     </Text>
    //     <Text className="text-[#DDC97A] ml-1 font-semibold text-sm">
    //       {isLogin ? "Créer un Compte" : "Connexion"}
    //     </Text>
    //   </Pressable>
    // </View>
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

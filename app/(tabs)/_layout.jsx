import { Tabs, useNavigation } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import "../../global.css";
import { UserContext } from "../../context/UserContext";
import { useContext, useEffect, useState } from "react";
import { useNavigationState } from "@react-navigation/native";
import { Keyboard, Platform } from "react-native";

export default function TabLayout() {
  const { userInfo, isAuthenticated } = useContext(UserContext);
  const navigation = useNavigation();
  const state = useNavigationState((state) => state);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
 
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (Platform.OS === "android") setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "#DDC97A",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: "/",
          headerShown: false,
          title: "Découvrir",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="navigate-circle-outline"
              size={29}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
          tabBarStyle: { display: isKeyboardVisible ? "none" : "flex" },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href:  isAuthenticated ? "/profile" : null,
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person"
              size={24}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          href: !isAuthenticated ? "/auth" : null,
          headerShown: false,
          title: "Auth",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="log-in"
              size={24}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              name="dev"
              size={24}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
        }}
      />
    </Tabs>
  );
}

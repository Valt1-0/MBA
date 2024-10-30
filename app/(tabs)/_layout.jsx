import { Tabs, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";
import { UserContext } from "../../context/UserContext";
import { useContext, useEffect } from "react";
import { useNavigationState } from "@react-navigation/native";

export default function TabLayout() {
  const { userInfo } = useContext(UserContext);
  const navigation = useNavigation();
  const state = useNavigationState((state) => state);


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
              size={35}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: userInfo?.isAuthenticated ? "/profile" : null,
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
          href: !userInfo?.isAuthenticated ? "/auth" : null,
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
    </Tabs>
  );
}

import { Link, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="splashscreen"
      screenOptions={{
        tabBarActiveTintColor: "#DDC97A",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="splashscreen"
        options={{
          headerShown: false,
          // href: null,
          title: "SplashScreen",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home"
              size={24}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home"
              size={24}
              color={focused ? "#DDC97A" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
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
    </Tabs>
  );
}

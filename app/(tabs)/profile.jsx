import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons"; // Importer les icônes
import SwipeUpPanel from "../../components/SwipeUp";

export default function Home() {
  const [activeButton, setActiveButton] = useState(null);

  return (
    <SafeAreaView className="flex-1 mb-[60px]">
      {/* <View className="flex items-center justify-center bg-gray-100">
        <Text className="text-xl font-bold">Home</Text>

        <View className="w-40 p-4 bg-white border rounded-lg shadow-lg mt-4">
          <Text className="text-xs font-bold">Tour Eiffel</Text>
          <Text className="text-gray-500 text-xs">Monument Historique</Text>

          <View className="flex-row justify-center items-center mt-4 gap-6">
            <View className="flex-row items-center gap-1">
              <Text className="text-xs">42</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("UP");
                  setActiveButton(activeButton === "up" ? null : "up");
                }}
              >
                <Entypo
                  name="arrow-bold-up"
                  size={20}
                  color={activeButton === "up" ? "#DDC97A" : "gray"}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs">5</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("DOWN");
                  setActiveButton(activeButton === "down" ? null : "down");
                }}
              >
                <Entypo
                  name="arrow-bold-down"
                  size={20}
                  color={activeButton === "down" ? "#DDC97A" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View> */}
      <SwipeUpPanel />
    </SafeAreaView>
  );
}

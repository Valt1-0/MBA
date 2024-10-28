import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import * as ExpoSplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { router } from "expo-router";

ExpoSplashScreen.preventAutoHideAsync();

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
const AnimatedLottieViewSplash2 = Animated.createAnimatedComponent(LottieView);

const SplashScreen = () => {
  const opacityAnimationLoading = new Animated.Value(0);
  const opacityAnimationSplash1 = new Animated.Value(1);
  const opacityAnimationSplash2 = new Animated.Value(0);
  const splashScreen2 = useRef(null);
  const [location, setLocation] = useState(null);

  const screenWidth = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(-screenWidth)).current;

  const handleAnimationComplete = () => {
    Animated.timing(translateX, {
      toValue: screenWidth,
      duration: 2800,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnimationSplash1, {
      toValue: 0,
      duration: 200, // Durée de l'animation de fondu en millisecondes
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnimationSplash2, {
      toValue: 1,
      duration: 200, // Durée de l'animation de fondu en millisecondes
      useNativeDriver: true,
    }).start();
    splashScreen2.current?.play(1);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      setLocation(userCoords);
    })();
  }, []);

  async function prepare() {
    try {
      Animated.timing(opacityAnimationLoading, {
        toValue: 1,
        duration: 200, // Durée de l'animation de fondu en millisecondes
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay
    } catch (e) {
      console.warn("Error : " + e);
    } finally {
      handleAnimationComplete();
    }
  }
  const onLayoutRootView = useCallback(async () => {
    await ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <View
      className="flex-1 bg-[#DDC97A] justify-center items-center"
      onLayout={onLayoutRootView}
    >
      <>
        <Animated.View
          style={[
            styles.animationContainer,
            { opacity: opacityAnimationSplash1 },
          ]}
        >
          <AnimatedLottieView
            source={require("../../assets/anims/MBA.json")}
            style={[styles.animation]}
            loop={false}
            autoPlay
            onAnimationFinish={prepare}
          />
          <AnimatedLottieViewSplash2
            source={require("../../assets/anims/MBA-Illustration.json")}
            style={[
              styles.loadingAnimation,
              { opacity: opacityAnimationLoading },
            ]}
            loop={true}
            autoPlay
          />
        </Animated.View>
        <AnimatedLottieView
          ref={splashScreen2}
          source={require("../../assets/anims/MBA-Illustration.json")}
          style={[styles.animation, { opacity: opacityAnimationSplash2 }]}
          loop={false}
          onAnimationFinish={() => {
            router.push("/");
          }}
        />
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  animation: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  loadingAnimation: {
    width: "30%",
    height: "30%",
    top: "50%",
    position: "absolute",
  },
  bannerText: {
    color: "white",
    textAlign: "center",
  },
  icon: {
    fontSize: 20,
    marginLeft: 5,
  },
});

export default SplashScreen;

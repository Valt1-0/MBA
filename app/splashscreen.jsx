import React, { useRef, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";

//ExpoSplashScreen.preventAutoHideAsync();

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
const AnimatedLottieViewSplash2 = Animated.createAnimatedComponent(LottieView);

const SplashScreen = () => {
    const navigation = useNavigation();
  const opacityAnimationLoading = new Animated.Value(0);
  const opacityAnimationSplash1 = new Animated.Value(1);
  const opacityAnimationSplash2 = new Animated.Value(0);
  const splashScreen2 = useRef(null);

  const screenWidth = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(-screenWidth)).current;

  // Choix aléatoire d'un message
  // const randomIndex = Math.floor(Math.random() * messages.length);
  // const randomMessage = messages[randomIndex];

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

  const startScrollAnimation = (event) => {
    const { width } = event.nativeEvent.layout;
    console.log("screenWidth", screenWidth, width, translateX);
    // Animation de déplacement
    Animated.timing(translateX, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  async function prepare() {
    try {
      Animated.timing(opacityAnimationLoading, {
        toValue: 1,
        duration: 200, // Durée de l'animation de fondu en millisecondes
        useNativeDriver: true,
      }).start();

      //Vérification permission
     // await permissionsCheck();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay
    } catch (e) {
      console.warn("Error : " + e);
    } finally {
      handleAnimationComplete();
    }
  }
  const onLayoutRootView = useCallback(async () => {
   // await ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <View
      className="flex-1 bg-[#70E575] justify-center items-center"
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
            source={require("../assets/anims/MBA.json")}
            style={[styles.animation]}
            loop={false}
            autoPlay
            onAnimationFinish={prepare}
          />
          <AnimatedLottieViewSplash2
            source={require("../assets/anims/MBA-Illustration.json")}
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
          source={require("../assets/anims/MBA-Illustration.json")}
          style={[styles.animation, { opacity: opacityAnimationSplash2 }]}
          loop={false}
          onAnimationFinish={() => {
            console.log("SplashScreen2 finish !");
            // navigation.replace("(tabs)");
          }}
        />
        {/* <AnimatedLottieViewText
          ref={splashScreen2}
          source={require("../../assets/anims/Jolt-SplashScreen-Part2.json")}
          style={[styles.animation, { opacity: opacityAnimationSplash2 }]}
          loop={false}
          onAnimationFinish={() => {
            navigation.replace("HomeScreen");
            // onEnd();
          }}
        /> */}
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
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
  },
  icon: {
    fontSize: 20,
    marginLeft: 5,
  },
  message: {
    fontSize: 16,
  },
});

export default SplashScreen;

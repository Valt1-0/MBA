// import React, { useRef, useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   Platform,
// } from "react-native";
// import LottieView from "lottie-react-native";
// import * as ExpoSplashScreen from "expo-splash-screen";
// import { router } from "expo-router";

// ExpoSplashScreen.preventAutoHideAsync();

// const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
// const AnimatedLottieViewSplash2 = Animated.createAnimatedComponent(LottieView);

// const SplashScreen = () => {
//   const opacityAnimationLoading = new Animated.Value(0);
//   const opacityAnimationSplash1 = new Animated.Value(1);

//   const screenWidth = Dimensions.get("window").width;
//   const translateX = useRef(new Animated.Value(-screenWidth)).current;

//   const handleAnimationComplete = () => {
//     Animated.timing(translateX, {
//       toValue: screenWidth,
//       duration: 2800,
//       useNativeDriver: true,
//     }).start();
//     Animated.timing(opacityAnimationSplash1, {
//       toValue: 0,
//       duration: 200, // Durée de l'animation de fondu en millisecondes
//       useNativeDriver: true,
//     }).start();

//     router.push("/(tabs)");
//   };

//   async function prepare() {
//     try {
//       Animated.timing(opacityAnimationLoading, {
//         toValue: 1,
//         duration: 200, // Durée de l'animation de fondu en millisecondes
//         useNativeDriver: true,
//       }).start();

//       await new Promise((resolve) => setTimeout(resolve, 4000)); // Delay
//     } catch (e) {
//       console.warn("Error : " + e);
//     } finally {
//       handleAnimationComplete();
//     }
//   }
//   const onLayoutRootView = useCallback(async () => {
//     await ExpoSplashScreen.hideAsync();
//   }, []);

//   return (
//     <View
//       className="flex-1 bg-[#DDC97A] justify-center items-center"
//       onLayout={onLayoutRootView}
//     >
//       <>
//         <Animated.View
//           style={[
//             styles.animationContainer,
//             { opacity: opacityAnimationSplash1 },
//           ]}
//         >
//           <AnimatedLottieView
//             source={require("../assets/anims/MBA.json")}
//             style={[styles.animation]}
//             loop={false}
//             autoPlay
//             onAnimationFinish={prepare}
//           />
//           <AnimatedLottieViewSplash2
//             source={require("../assets/anims/MBA-Illus1.json")}
//             style={[
//               styles.loadingAnimation,
//               { opacity: opacityAnimationLoading },
//             ]}
//             loop={true}
//             autoPlay
//           />
//         </Animated.View>
//       </>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   animationContainer: {
//     width: "100%",
//     height: "100%",
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//   },
//   animation: {
//     width: "100%",
//     height: "100%",
//     top: "-10%",
//     position: "absolute",
//   },
//   loadingAnimation: {
//     width: "55%",
//     height: "55%",
//     top: "35%",
//     position: "absolute",
//   },
// });

// export default SplashScreen;
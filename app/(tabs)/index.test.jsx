// // index.test.jsx
// import React from "react";
// import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
// import HomeScreen from "./index";
// import * as Location from "expo-location";
// import { UserContext } from "../../context/UserContext";
// import { queryNearbyPlaces, addPlace } from "../../utils/functions";

// // Mock dependencies
// jest.mock("expo-location");
// jest.mock("../../utils/functions");
// jest.mock("expo-router", () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//   }),
// }));

// // Mock context
// const mockUserContext = {
//   userInfo: { id: "test-user" },
//   isAuthenticated: true,
// };

// // Mock geolocation response
// const mockLocation = {
//   coords: {
//     latitude: 48.8566,
//     longitude: 2.3522,
//   },
// };

// // Setup test wrapper
// const renderWithContext = (component) => {
//   return render(
//     <UserContext.Provider value={mockUserContext}>
//       {component}
//     </UserContext.Provider>
//   );
// };

// describe("HomeScreen", () => {
//   beforeEach(() => {
//     // Reset all mocks before each test
//     jest.clearAllMocks();

//     // Setup location mock
//     Location.requestForegroundPermissionsAsync.mockResolvedValue({
//       status: "granted",
//     });
//     Location.getCurrentPositionAsync.mockResolvedValue(mockLocation);
//     Location.getLastKnownPositionAsync.mockResolvedValue(mockLocation);
//     Location.reverseGeocodeAsync.mockResolvedValue([{ city: "Paris" }]);

//     // Setup nearby places mock
//     queryNearbyPlaces.mockResolvedValue([
//       {
//         id: "1",
//         name: "Test Place",
//         latitude: 48.8566,
//         longitude: 2.3522,
//         type: "Tourism",
//       },
//     ]);
//   });

//   test("renders correctly with initial state", async () => {
//     const { getByText } = renderWithContext(<HomeScreen />);

//     await waitFor(() => {
//       expect(getByText("Nouveautés à Paris")).toBeTruthy();
//     });
//   });

//   test("requests location permissions on mount", async () => {
//     renderWithContext(<HomeScreen />);

//     await waitFor(() => {
//       expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
//     });
//   });

//   test("handles marker press", async () => {
//     const { getByTestId } = renderWithContext(<HomeScreen />);

//     await waitFor(() => {
//       const marker = getByTestId("map-marker-1");
//       fireEvent.press(marker);
//       expect(getByTestId("place-details")).toBeTruthy();
//     });
//   });

//   test("handles add place", async () => {
//     const { getByText, getByPlaceholderText } = renderWithContext(
//       <HomeScreen />
//     );

//     await act(async () => {
//       // Simulate long press on map
//       fireEvent(getByTestId("map-view"), "onLongPress", {
//         nativeEvent: {
//           coordinate: {
//             latitude: 48.8566,
//             longitude: 2.3522,
//           },
//         },
//       });
//     });

//     await waitFor(() => {
//       const input = getByPlaceholderText("Nom de votre Adresse");
//       fireEvent.changeText(input, "New Place");

//       const addButton = getByText("check");
//       fireEvent.press(addButton);

//       expect(addPlace).toHaveBeenCalledWith(
//         expect.objectContaining({
//           name: "New Place",
//           latitude: 48.8566,
//           longitude: 2.3522,
//         }),
//         mockUserContext.userInfo
//       );
//     });
//   });

//   test("handles location tracking toggle", async () => {
//     const { getByTestId } = renderWithContext(<HomeScreen />);

//     await waitFor(() => {
//       const locationButton = getByTestId("location-button");
//       fireEvent.press(locationButton);
//       expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
//     });
//   });

//   test("updates places when slider value changes", async () => {
//     const { getByTestId } = renderWithContext(<HomeScreen />);

//     await act(async () => {
//       const slider = getByTestId("range-slider");
//       fireEvent(slider, "onSlidingComplete", 30);
//     });

//     await waitFor(() => {
//       expect(queryNearbyPlaces).toHaveBeenCalledWith([48.8566, 2.3522], 3000);
//     });
//   });
// });

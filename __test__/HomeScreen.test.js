// __tests__/HomeScreen.test.js

import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { UserContext } from "../context/UserContext";
import HomeScreen from "../app/(tabs)";
import { queryNearbyPlaces, addPlace } from "../utils/functions";

// Mocks
jest.mock("expo-location");
jest.mock("geolib");
jest.mock("../utils/functions");
jest.mock("react-native-maps");
jest.mock("@expo/vector-icons");
jest.mock("react-native-gesture-handler");
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("HomeScreen", () => {
  const mockUserLocation = {
    coords: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
  };

  const mockUserContext = {
    userInfo: { id: "test-user" },
    isAuthenticated: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Location.getCurrentPositionAsync.mockResolvedValue(mockUserLocation);
    Location.getLastKnownPositionAsync.mockResolvedValue(mockUserLocation);
    Location.reverseGeocodeAsync.mockResolvedValue([{ city: "Paris" }]);
    getDistance.mockReturnValue(500);
    queryNearbyPlaces.mockResolvedValue([
      { id: "1", latitude: 48.8566, longitude: 2.3522, type: "Museum" },
    ]);
  });

  test("demande les permissions de localisation au démarrage", async () => {
    await act(async () => {
      render(
        <UserContext.Provider value={mockUserContext}>
          <HomeScreen />
        </UserContext.Provider>
      );
    });

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  test("effectue une requête des lieux proches", async () => {
    await act(async () => {
      render(
        <UserContext.Provider value={mockUserContext}>
          <HomeScreen />
        </UserContext.Provider>
      );
    });

    expect(queryNearbyPlaces).toHaveBeenCalledWith(
      [mockUserLocation.coords.latitude, mockUserLocation.coords.longitude],
      expect.any(Number)
    );
  });

  test("met à jour la position utilisateur lors du changement de localisation", async () => {
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <HomeScreen />
      </UserContext.Provider>
    );

    const newLocation = {
      nativeEvent: {
        coordinate: {
          latitude: 48.85,
          longitude: 2.35,
        },
      },
    };

    await act(async () => {
      fireEvent(getByTestId("map-view"), "userLocationChange", newLocation);
    });

    expect(getDistance).toHaveBeenCalled();
  });

  test("ajoute un nouveau lieu correctement", async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <UserContext.Provider value={mockUserContext}>
        <HomeScreen />
      </UserContext.Provider>
    );

    const placeData = {
      name: "Test Place",
      type: "Museum",
      rating: 4,
      description: "Test Description",
    };

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText("Nom de votre Adresse"),
        placeData.name
      );
      fireEvent.changeText(
        getByPlaceholderText("Description de votre Adresse"),
        placeData.description
      );
      fireEvent.press(getByTestId("type-Museum"));
      fireEvent.press(getByTestId("rating-4"));
      fireEvent.press(getByTestId("submit-place"));
    });

    expect(addPlace).toHaveBeenCalledWith(
      expect.objectContaining(placeData),
      mockUserContext.userInfo
    );
  });

  test("gère correctement le délai entre les requêtes", async () => {
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <HomeScreen />
      </UserContext.Provider>
    );

    // Première requête
    await act(async () => {
      fireEvent(getByTestId("map-view"), "userLocationChange", {
        nativeEvent: { coordinate: mockUserLocation.coords },
      });
    });

    // Deuxième requête immédiate (devrait être ignorée)
    await act(async () => {
      fireEvent(getByTestId("map-view"), "userLocationChange", {
        nativeEvent: { coordinate: mockUserLocation.coords },
      });
    });

    expect(queryNearbyPlaces).toHaveBeenCalledTimes(1);
  });
});

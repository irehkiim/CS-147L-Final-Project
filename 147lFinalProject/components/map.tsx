/* Citations for react-native-maps:
 * 1. official documentation: https://docs.expo.dev/versions/latest/sdk/map-view/
 * 2. tutorials on sample usage (style/interactivity): https://www.npmjs.com/package/react-native-maps
 * 3. tutorials on customizing the map: https://blog.spirokit.com/maps-in-react-native-a-step-by-step-guide
 * 4. tutorials on customizing the map pins: https://blog.spirokit.com/maps-in-react-native-adding-interactive-markers
 */

import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Entypo from "@expo/vector-icons/Entypo";
import * as Location from "expo-location";
import { theme } from "../assets/theme";
import { mapStyle } from "../assets/map-style";
import { Event } from "../utils/types";
import EventMarkers from "./marker";
import { supabase } from "../supabase";

const { markerColors, sizes } = theme;

export default function Map() {
  // Citation for location code: Lecture 5a snack - https://snack.expo.dev/@alan7cheng/cs-147l-25au---lecture-5a
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const mapRef = useRef<MapView | null>(null);

  const getLocation = () => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied...");
          return null;
        }
        return Location.getCurrentPositionAsync();
      })
      .then((loc) => {
        if (loc != null) {
          setLocation(loc);
          const { latitude, longitude } = loc.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      });
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      const allEvents: Event[] = data ?? [];
      setEvents(allEvents);

      return allEvents.map((event) => ({
        id: event.id,
        name: event.name,
        activity_type: event.activity_type,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    getLocation();
    fetchEvents();

    const channel = supabase
      .channel("realtime-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          console.log("Events changed:", payload);
          fetchEvents();
        }
      )
      .subscribe();
  }, []);

  // Make the map refocus so that most markers appear
  useEffect(() => {
    if (!mapRef.current || !region) return;
    if (events.length === 0) return;

    const coords = events
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        latitude: e.latitude as number,
        longitude: e.longitude as number,
      }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  }, [region, events]);

  // While we don't have a region yet, show a simple loading / error UI
  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Getting your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        key={events.length}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        customMapStyle={mapStyle}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
        >
          <View style={styles.markerCircle}>
            <Entypo name="home" size={theme.sizes.markerIcon} color="black" />
          </View>
        </Marker>
        <EventMarkers events={events} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  markerCircle: {
    backgroundColor: markerColors.Home,
    height: sizes.markerCircle,
    aspectRatio: 1,
    borderRadius: sizes.markerCircleRadius,
    borderWidth: 2,

    alignItems: "center",
    justifyContent: "center",
  },
});

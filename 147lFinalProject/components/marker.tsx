import React from "react";

import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { theme } from "../assets/theme";
import { Event } from "../utils/types";
import { getActivityStyle } from "../utils/getEventIcons";

type EventMarkersProps = {
  events: Event[];
};

const { sizes } = theme;

export default function EventMarkers({ events }: EventMarkersProps) {
  return (
    <>
      {events
        .filter((event) => event.latitude != null && event.longitude != null)
        .map((event) => {
          const { icon, color } = getActivityStyle(event.activity_type);

          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude!,
                longitude: event.longitude!,
              }}
              title={event.name}
              description={event.location ?? undefined}
            >
              <View style={[styles.markerCircle, { backgroundColor: color }]}>
                {icon}
              </View>
            </Marker>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  markerCircle: {
    height: sizes.markerCircle,
    aspectRatio: 1,
    borderRadius: sizes.markerCircleRadius,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from 'react'
import { View, StyleSheet } from 'react-native'
import MapLibreGL from '@maplibre/maplibre-react-native'
import type { Coordinates } from '@/types'

interface Props {
  coordinates: Coordinates
}

export default function UserMarker({ coordinates }: Props) {
  return (
    <MapLibreGL.PointAnnotation
      id="user-location"
      coordinate={[coordinates.longitude, coordinates.latitude]}
    >
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    </MapLibreGL.PointAnnotation>
  )
}

const styles = StyleSheet.create({
  outer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1976d2',
    borderWidth: 2,
    borderColor: '#fff',
  },
})

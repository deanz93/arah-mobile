import React, { useRef } from 'react'
import { StyleSheet } from 'react-native'
import MapLibreGL from '@maplibre/maplibre-react-native'
import UserMarker from './UserMarker'
import ReportMarker from './ReportMarker'
import RouteLayer from './RouteLayer'
import { useMapStore } from '@/store/mapStore'
import { useReportStore } from '@/store/reportStore'
import { useRoutingStore } from '@/store/routingStore'
import { MAP_CONFIG } from '@/constants'

MapLibreGL.setAccessToken(null)

export default function ArahMapView() {
  const camera = useRef<MapLibreGL.Camera>(null)
  const { cameraCenter, zoomLevel, userLocation, setFollowingUser } = useMapStore()
  const { reports } = useReportStore()
  const { activeRoute } = useRoutingStore()

  return (
    <MapLibreGL.MapView
      style={styles.map}
      styleURL={MAP_CONFIG.STYLE_URL}
      onTouchStart={() => setFollowingUser(false)}
    >
      <MapLibreGL.Camera
        ref={camera}
        centerCoordinate={[cameraCenter.longitude, cameraCenter.latitude]}
        zoomLevel={zoomLevel}
        animationMode="flyTo"
        animationDuration={300}
      />

      {activeRoute && <RouteLayer route={activeRoute} />}

      {reports.map((report) => (
        <ReportMarker key={report.id} report={report} />
      ))}

      {userLocation && <UserMarker coordinates={userLocation} />}
    </MapLibreGL.MapView>
  )
}

const styles = StyleSheet.create({
  map: { flex: 1 },
})

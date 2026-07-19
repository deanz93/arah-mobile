import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { getRoutes } from '@/services/routingService'
import { useMapStore } from '@/store/mapStore'
import { useRoutingStore } from '@/store/routingStore'
import { formatDistance, formatDuration, formatTollCost } from '@/utils/formatters'
import type { RootStackParamList } from '@/navigation/types'
import type { Route } from '@/types'

type RoutePreviewRouteProp = RouteProp<RootStackParamList, 'RoutePreview'>

export default function RoutePreviewScreen() {
  const navigation = useNavigation()
  const route = useRoute<RoutePreviewRouteProp>()
  const { userLocation } = useMapStore()
  const { setActiveRoute, setDestination, setNavigationState } = useRoutingStore()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { destination } = route.params

  useEffect(() => {
    if (!userLocation) return
    getRoutes(userLocation, destination.coordinates, { avoidTolls: false, avoidHighways: false, alternatives: 3 })
      .then(setRoutes)
      .catch(() => setError('Gagal mengira laluan. Cuba lagi.'))
      .finally(() => setLoading(false))
  }, [userLocation, destination.coordinates])

  const handleStart = (selectedRoute: Route) => {
    setActiveRoute(selectedRoute)
    setDestination(destination)
    setNavigationState('navigating')
    navigation.navigate('Navigation' as never, { route: selectedRoute, destination: destination.displayName } as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{destination.displayName.split(',')[0]}</Text>
      </View>

      {loading && <ActivityIndicator style={styles.loader} size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={[styles.routeCard, index === 0 && styles.routeCardBest]} onPress={() => handleStart(item)}>
            <View style={styles.routeInfo}>
              <Text style={styles.routeSummary}>{item.summary}</Text>
              <Text style={styles.routeMeta}>
                {formatDuration(item.durationSeconds, 'ms')} · {formatDistance(item.distanceMeters, 'ms')}
              </Text>
              <Text style={[styles.tollCost, item.hasTolls && styles.tollCostActive]}>
                {formatTollCost(item.tollCostMyr)}
              </Text>
            </View>
            <TouchableOpacity style={styles.goBtn} onPress={() => handleStart(item)}>
              <Text style={styles.goBtnText}>Pergi</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  back: { fontSize: 22 },
  title: { flex: 1, fontSize: 18, fontWeight: '700' },
  loader: { marginTop: 40 },
  error: { textAlign: 'center', color: '#e53e3e', padding: 20 },
  routeCard: { margin: 12, padding: 16, borderRadius: 12, backgroundColor: '#f8f8f8', flexDirection: 'row', alignItems: 'center' },
  routeCardBest: { backgroundColor: '#e8f5e9', borderWidth: 2, borderColor: '#43a047' },
  routeInfo: { flex: 1 },
  routeSummary: { fontSize: 16, fontWeight: '600' },
  routeMeta: { color: '#555', marginTop: 4 },
  tollCost: { color: '#888', marginTop: 4 },
  tollCostActive: { color: '#e65100' },
  goBtn: { backgroundColor: '#1565c0', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  goBtnText: { color: '#fff', fontWeight: '700' },
})

import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import ArahMapView from '@/components/Map/ArahMapView'
import SearchBar from '@/components/Search/SearchBar'
import ReportFab from '@/components/Report/ReportFab'
import { useLocation } from '@/hooks/useLocation'
import { useMapStore } from '@/store/mapStore'
import type { RootStackNavProp } from '@/navigation/types'

export default function MapScreen() {
  const navigation = useNavigation<RootStackNavProp>()
  const { userLocation } = useMapStore()

  useLocation()

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search', {
      onSelect: (result) => {
        navigation.navigate('RoutePreview', {
          destination: result,
          routes: [],
        })
      },
    })
  }, [navigation])

  const handleReportPress = useCallback(() => {
    navigation.navigate('Report', { coordinates: userLocation ?? undefined })
  }, [navigation, userLocation])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ArahMapView />
      <View style={styles.searchContainer}>
        <SearchBar onPress={handleSearchPress} placeholder="Cari destinasi..." />
      </View>
      <ReportFab onPress={handleReportPress} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
  },
})

import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Tts from 'react-native-tts'
import ArahMapView from '@/components/Map/ArahMapView'
import ManoeuvreBar from '@/components/Navigation/ManoeuvreBar'
import NavBottomBar from '@/components/Navigation/NavBottomBar'
import { useRoutingStore } from '@/store/routingStore'
import { useMapStore } from '@/store/mapStore'
import { haversineDistance } from '@/utils/geoUtils'
import { REROUTE_THRESHOLD_METERS, VOICE_PROMPT_DISTANCES } from '@/constants'

export default function NavigationScreen() {
  const navigation = useNavigation()
  const { activeRoute, currentManoeuvre, advanceManoeuvre, clearNavigation, updateProgress } =
    useRoutingStore()
  const { userLocation } = useMapStore()

  useEffect(() => {
    Tts.setDefaultLanguage('ms-MY')
  }, [])

  useEffect(() => {
    if (!userLocation || !currentManoeuvre) return

    const distToTurn = currentManoeuvre.distanceMeters
    const promptedDistances = VOICE_PROMPT_DISTANCES

    promptedDistances.forEach((dist) => {
      if (Math.abs(distToTurn - dist) < 10) {
        const promptText =
          dist === 50
            ? currentManoeuvre.instruction
            : `Dalam ${dist} meter, ${currentManoeuvre.instruction}`
        Tts.speak(promptText)
      }
    })

    if (distToTurn < 10) {
      advanceManoeuvre()
    }
  }, [userLocation, currentManoeuvre, advanceManoeuvre])

  const handleCancel = () => {
    Tts.stop()
    clearNavigation()
    navigation.goBack()
  }

  if (!activeRoute) return null

  return (
    <View style={styles.container}>
      <ArahMapView />
      {currentManoeuvre && <ManoeuvreBar manoeuvre={currentManoeuvre} />}
      <NavBottomBar onCancel={handleCancel} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})

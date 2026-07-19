import React, { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import auth from '@react-native-firebase/auth'
import { submitReport } from '@/services/reportService'
import { useMapStore } from '@/store/mapStore'
import { REPORT_ICONS } from '@/constants'
import type { ReportType } from '@/types'

const REPORT_LABELS: Record<ReportType, string> = {
  police: 'Polis / Perangkap',
  accident: 'Kemalangan',
  flood: 'Banjir / Jalan Ditenggelami',
  roadblock: 'Sekatan Jalan Raya',
  pothole: 'Lubang Jalan',
  hazard: 'Bahaya Lain',
}

export default function ReportScreen() {
  const navigation = useNavigation()
  const { userLocation } = useMapStore()
  const [loading, setLoading] = useState(false)

  const handleReport = async (type: ReportType) => {
    if (!userLocation) {
      Alert.alert('GPS tidak tersedia', 'Sila pastikan GPS anda dihidupkan.')
      return
    }

    const uid = auth().currentUser?.uid
    if (!uid) return

    setLoading(true)
    try {
      await submitReport(type, userLocation, uid)
      Alert.alert('Terima kasih!', 'Laporan anda telah dihantar.')
      navigation.goBack()
    } catch {
      Alert.alert('Ralat', 'Gagal menghantar laporan. Cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Laporkan Kejadian</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <View style={styles.grid}>
          {(Object.entries(REPORT_LABELS) as [ReportType, string][]).map(([type, label]) => (
            <TouchableOpacity key={type} style={styles.reportBtn} onPress={() => handleReport(type)}>
              <Text style={styles.reportIcon}>{REPORT_ICONS[type]}</Text>
              <Text style={styles.reportLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 20, fontWeight: '700' },
  close: { fontSize: 20, color: '#666' },
  loader: { marginTop: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  reportBtn: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportIcon: { fontSize: 36 },
  reportLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center', color: '#333' },
})

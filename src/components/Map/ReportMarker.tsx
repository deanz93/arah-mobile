import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { voteReport } from '@/services/reportService'
import { REPORT_ICONS } from '@/constants'
import type { Report } from '@/types'

interface Props {
  report: Report
}

export default function ReportMarker({ report }: Props) {
  const handlePress = () => {
    Alert.alert(
      REPORT_ICONS[report.type] + ' Laporan',
      `Upvote: ${report.upvotes} | Tidak tepat: ${report.downvotes}`,
      [
        { text: '👍 Masih ada', onPress: () => voteReport(report.id, 'up') },
        { text: '✕ Sudah berlalu', onPress: () => voteReport(report.id, 'down') },
        { text: 'Tutup', style: 'cancel' },
      ],
    )
  }

  return (
    <MapLibreGL.PointAnnotation
      id={`report-${report.id}`}
      coordinate={[report.coordinates.longitude, report.coordinates.latitude]}
      onSelected={handlePress}
    >
      <TouchableOpacity style={styles.marker} onPress={handlePress}>
        <Text style={styles.icon}>{REPORT_ICONS[report.type]}</Text>
      </TouchableOpacity>
    </MapLibreGL.PointAnnotation>
  )
}

const styles = StyleSheet.create({
  marker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: { fontSize: 20 },
})

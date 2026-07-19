import React from 'react'
import { StyleSheet, TouchableOpacity, Text } from 'react-native'

interface Props {
  onPress: () => void
}

export default function ReportFab({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.label}>Lapor</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  icon: { fontSize: 18 },
  label: { fontWeight: '700', fontSize: 15, color: '#333' },
})

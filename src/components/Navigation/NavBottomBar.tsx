import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRoutingStore } from '@/store/routingStore'
import { useUserStore } from '@/store/userStore'
import { formatDistance, formatDuration, formatETA } from '@/utils/formatters'

interface Props {
  onCancel: () => void
}

export default function NavBottomBar({ onCancel }: Props) {
  const insets = useSafeAreaInsets()
  const { etaSeconds, distanceRemainingMeters } = useRoutingStore()
  const { user } = useUserStore()
  const lang = user?.preferredLanguage ?? 'ms'

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(etaSeconds, lang)}</Text>
          <Text style={styles.statLabel}>Masa</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(distanceRemainingMeters, lang)}</Text>
          <Text style={styles.statLabel}>Jarak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatETA(etaSeconds)}</Text>
          <Text style={styles.statLabel}>Tiba</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Tamat</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  stats: { flex: 1, flexDirection: 'row', gap: 20 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  cancelBtn: { backgroundColor: '#e53e3e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  cancelText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})

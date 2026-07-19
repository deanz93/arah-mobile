import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Manoeuvre } from '@/types'
import { useUserStore } from '@/store/userStore'

const MANOEUVRE_ARROWS: Record<string, string> = {
  turn_left: '↰',
  turn_right: '↱',
  turn_slight_left: '↖',
  turn_slight_right: '↗',
  turn_sharp_left: '↙',
  turn_sharp_right: '↘',
  straight: '↑',
  roundabout: '↻',
  u_turn: '↩',
  destination: '🏁',
  depart: '↑',
}

interface Props {
  manoeuvre: Manoeuvre
}

export default function ManoeuvreBar({ manoeuvre }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useUserStore()
  const lang = user?.preferredLanguage ?? 'ms'

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.arrow}>{MANOEUVRE_ARROWS[manoeuvre.type] ?? '↑'}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.instruction}>
          {lang === 'ms' ? manoeuvre.instruction : manoeuvre.instruction_en}
        </Text>
        <Text style={styles.distance}>{manoeuvre.distanceMeters}m</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1565c0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  arrow: { fontSize: 40, color: '#fff' },
  textContainer: { flex: 1 },
  instruction: { fontSize: 18, fontWeight: '700', color: '#fff' },
  distance: { fontSize: 14, color: '#90caf9', marginTop: 2 },
})

import React from 'react'
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import auth from '@react-native-firebase/auth'
import { useUserStore } from '@/store/userStore'

export default function SettingsScreen() {
  const { user, setLanguage, updatePreferences } = useUserStore()

  const handleSignOut = () => {
    Alert.alert('Log keluar', 'Adakah anda pasti?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Log keluar', style: 'destructive', onPress: () => auth().signOut() },
    ])
  }

  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Tetapan</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BAHASA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Bahasa Malaysia</Text>
          <Switch
            value={user.preferredLanguage === 'ms'}
            onValueChange={(val) => setLanguage(val ? 'ms' : 'en')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PILIHAN LALUAN</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Elak tol</Text>
          <Switch
            value={user.routePreferences.avoidTolls}
            onValueChange={(val) => updatePreferences({ avoidTolls: val })}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Elak lebuh raya</Text>
          <Switch
            value={user.routePreferences.avoidHighways}
            onValueChange={(val) => updatePreferences({ avoidHighways: val })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AKAUN</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Laporan dikemukakan</Text>
          <Text style={styles.value}>{user.reportCount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Log Keluar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  heading: { fontSize: 28, fontWeight: '800', padding: 20 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: '#999', padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  label: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: '600', color: '#1565c0' },
  signOutBtn: { margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center' },
  signOutText: { color: '#e53e3e', fontWeight: '700', fontSize: 16 },
})

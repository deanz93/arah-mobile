import React, { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

GoogleSignin.configure()

export default function OnboardingScreen() {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await GoogleSignin.hasPlayServices()
      const { idToken } = await GoogleSignin.signIn()
      const credential = auth.GoogleAuthProvider.credential(idToken)
      await auth().signInWithCredential(credential)
    } catch (err) {
      Alert.alert('Log masuk gagal', 'Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🧭</Text>
        <Text style={styles.appName}>Arah</Text>
        <Text style={styles.tagline}>Tunjuk Arah, Bersama</Text>
        <Text style={styles.subtitle}>Navigasi Malaysia yang dibina untuk rakyat Malaysia</Text>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator size="large" color="#1565c0" />
        ) : (
          <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
            <Text style={styles.googleBtnText}>Daftar masuk dengan Google</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.terms}>
          Dengan mendaftar masuk, anda bersetuju dengan Terma dan Syarat kami.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1565c0' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logo: { fontSize: 80 },
  appName: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  tagline: { fontSize: 18, color: '#90caf9', fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: '#bbdefb', textAlign: 'center', paddingHorizontal: 32, marginTop: 8 },
  actions: { padding: 32, gap: 16 },
  googleBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  googleBtnText: { fontSize: 16, fontWeight: '700', color: '#1565c0' },
  terms: { fontSize: 12, color: '#bbdefb', textAlign: 'center' },
})

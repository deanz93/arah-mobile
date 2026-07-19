import React, { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth'
import AppNavigator from '@/navigation'
import { useUserStore } from '@/store/userStore'

const queryClient = new QueryClient()

export default function App() {
  const { setUser, setLoading } = useUserStore()

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? 'Pengguna',
          preferredLanguage: 'ms',
          routePreferences: { avoidTolls: false, avoidHighways: false },
          savedPlaces: [],
          reportCount: 0,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

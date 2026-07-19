import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { RootStackParamList, MainTabParamList } from './types'

import MapScreen from '@/screens/MapScreen'
import SearchScreen from '@/screens/SearchScreen'
import RoutePreviewScreen from '@/screens/RoutePreviewScreen'
import NavigationScreen from '@/screens/NavigationScreen'
import ReportScreen from '@/screens/ReportScreen'
import SettingsScreen from '@/screens/SettingsScreen'
import OnboardingScreen from '@/screens/OnboardingScreen'
import { useUserStore } from '@/store/userStore'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user } = useUserStore()

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="RoutePreview" component={RoutePreviewScreen} />
            <Stack.Screen name="Navigation" component={NavigationScreen} />
            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

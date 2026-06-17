import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { RootNavigator } from './src/navigation/RootNavigator'
import { useAuthStore } from './src/store/auth.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 },
  },
})

// DEV PREVIEW: seeds a dummy retailer so the home screen renders without login
// Bypasses SecureStore (not available on web) by calling setState directly
function DevSeed() {
  useEffect(() => {
    useAuthStore.setState({
      user: { id: 'dev-1', full_name: 'Aisha Musa', email: 'aisha@shago.ng', phone: '08012345678', role: 'RETAILER' },
      token: 'dev-token',
    })
  }, [])
  return null
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DevSeed />
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

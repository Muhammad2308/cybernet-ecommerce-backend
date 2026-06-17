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

// DEV PREVIEW: seeds a dummy traveler bypassing SecureStore (not available on web)
function DevSeed() {
  useEffect(() => {
    useAuthStore.setState({
      user: { id: 'dev-1', full_name: 'Emeka Okafor', email: 'emeka@rido.ng', phone: '08098765432', role: 'TRAVELER' },
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

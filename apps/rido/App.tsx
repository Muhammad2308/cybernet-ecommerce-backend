import React from 'react'
import { StyleSheet, View, Platform, useWindowDimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { RootNavigator } from './src/navigation/RootNavigator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 },
  },
})

function MobileWebWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width > 500

  if (!isWebDesktop) {
    return <View style={styles.fullScreen}>{children}</View>
  }

  return (
    <View style={styles.webContainer}>
      <View style={styles.phoneFrame}>
        <View style={styles.phoneNotch}>
          <View style={styles.cameraDot} />
          <View style={styles.speakerBar} />
        </View>
        <View style={styles.phoneScreen}>{children}</View>
      </View>
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MobileWebWrapper>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </MobileWebWrapper>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    minHeight: '100vh' as any,
  },
  phoneFrame: {
    width: 420,
    height: 860,
    maxHeight: '94vh' as any,
    backgroundColor: '#0f172a',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  phoneNotch: {
    height: 24,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 999,
  },
  cameraDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
    marginRight: 8,
  },
  speakerBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
})

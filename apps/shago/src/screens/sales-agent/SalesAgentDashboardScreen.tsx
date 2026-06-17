import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuthStore } from '../../store/auth.store'

export function SalesAgentDashboardScreen() {
  const user = useAuthStore((s) => s.user)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Dashboard</Text>
      <Text style={styles.sub}>Hello, {user?.full_name}. Manage your territory and orders.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

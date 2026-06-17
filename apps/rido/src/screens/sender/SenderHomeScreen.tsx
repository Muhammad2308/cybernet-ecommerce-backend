import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuthStore } from '../../store/auth.store'

export function SenderHomeScreen() {
  const user = useAuthStore((s) => s.user)
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi, {user?.full_name?.split(' ')[0]} 👋</Text>
      <Text style={styles.sub}>Where would you like to send today?</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  greeting: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8, fontSize: 15 },
})

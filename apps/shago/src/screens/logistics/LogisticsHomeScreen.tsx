import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuthStore } from '../../store/auth.store'

export function LogisticsHomeScreen() {
  const user = useAuthStore((s) => s.user)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready, {user?.full_name?.split(' ')[0]}?</Text>
      <Text style={styles.sub}>Assigned jobs will appear here.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

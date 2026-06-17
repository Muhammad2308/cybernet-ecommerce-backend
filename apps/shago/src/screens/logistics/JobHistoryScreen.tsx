import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function JobHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job History</Text>
      <Text style={styles.sub}>Your completed and past deliveries.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

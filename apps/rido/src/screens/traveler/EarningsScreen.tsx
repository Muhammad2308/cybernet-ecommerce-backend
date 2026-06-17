import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Earnings</Text>
      <Text style={styles.sub}>Your delivery earnings summary will appear here.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function FleetEarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fleet Earnings</Text>
      <Text style={styles.sub}>Track revenue across all fleet drivers.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

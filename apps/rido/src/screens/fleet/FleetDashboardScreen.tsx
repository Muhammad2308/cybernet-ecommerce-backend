import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function FleetDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fleet Dashboard</Text>
      <Text style={styles.sub}>Overview of your fleet's performance.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

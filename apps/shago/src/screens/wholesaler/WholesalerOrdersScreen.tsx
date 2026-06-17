import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function WholesalerOrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Orders</Text>
      <Text style={styles.sub}>Orders from retailers will appear here.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

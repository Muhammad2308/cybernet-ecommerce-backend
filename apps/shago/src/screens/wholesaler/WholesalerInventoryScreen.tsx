import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function WholesalerInventoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <Text style={styles.sub}>Manage your product catalog and stock levels.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

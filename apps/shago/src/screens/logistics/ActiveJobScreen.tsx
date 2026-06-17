import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function ActiveJobScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Job</Text>
      <Text style={styles.sub}>No active job right now.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 40 },
  sub: { color: '#aaa', marginTop: 8 },
})

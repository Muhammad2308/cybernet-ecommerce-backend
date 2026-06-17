import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuthStore } from '../../store/auth.store'
import { useLogout } from '../../hooks/useAuth'

export function WholesalerProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.full_name}</Text>
      <Text style={styles.role}>Wholesaler</Text>
      <TouchableOpacity style={styles.btn} onPress={() => logout()}>
        <Text style={styles.btnText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', padding: 24 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 40 },
  role: { color: '#e94560', fontSize: 13, fontWeight: '600', marginTop: 6 },
  btn: { marginTop: 40, backgroundColor: '#e94560', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
})

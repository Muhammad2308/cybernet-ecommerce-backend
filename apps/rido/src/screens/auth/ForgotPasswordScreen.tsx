import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.sub}>Enter your email to receive a reset link.</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Sent', 'Check your email for a reset link.')}>
        <Text style={styles.btnText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  sub: { color: '#aaa', marginBottom: 32 },
  input: { backgroundColor: '#16213e', color: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 15 },
  btn: { backgroundColor: '#e94560', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import { useRegister } from '../../hooks/useAuth'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

const ROLES = [
  { label: 'Retailer — I buy from wholesalers', value: 'RETAILER' as const },
  { label: 'Wholesaler — I supply to retailers', value: 'WHOLESALER' as const },
  { label: 'Sales Agent — I represent a wholesaler', value: 'SALES_AGENT' as const },
  { label: 'Logistics Agent — I deliver orders', value: 'LOGISTICS_AGENT' as const },
]

export function RegisterScreen({ route }: Props) {
  const initialRole = route.params?.role ?? 'RETAILER'
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: initialRole, business_name: '' })
  const { mutate: register, isPending } = useRegister()

  const update = (key: keyof typeof form) => (val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleRegister = () => {
    if (!form.full_name || !form.email || !form.phone || !form.password) {
      return Alert.alert('Error', 'Please fill in all required fields')
    }
    register(
      { full_name: form.full_name, email: form.email, phone: form.phone, password: form.password, role: form.role, business_name: form.business_name || undefined },
      { onError: (err: any) => Alert.alert('Registration failed', err?.response?.data?.error ?? 'Unknown error') },
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join SHAGO</Text>

      <Text style={styles.label}>I am a...</Text>
      <View style={styles.roleList}>
        {ROLES.map((r) => (
          <TouchableOpacity key={r.value} style={[styles.roleBtn, form.role === r.value && styles.roleBtnActive]} onPress={() => update('role')(r.value)}>
            <Text style={[styles.roleBtnText, form.role === r.value && styles.roleBtnTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#666" value={form.full_name} onChangeText={update('full_name')} />
      {(form.role === 'WHOLESALER' || form.role === 'RETAILER') && (
        <TextInput style={styles.input} placeholder="Business Name" placeholderTextColor="#666" value={form.business_name} onChangeText={update('business_name')} />
      )}
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={update('email')} />
      <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#666" keyboardType="phone-pad" value={form.phone} onChangeText={update('phone')} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" secureTextEntry value={form.password} onChangeText={update('password')} />

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={isPending}>
        {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0f3460', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 10 },
  roleList: { marginBottom: 24 },
  roleBtn: { padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#333', marginBottom: 8 },
  roleBtnActive: { borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.1)' },
  roleBtnText: { color: '#aaa', fontSize: 14 },
  roleBtnTextActive: { color: '#e94560', fontWeight: '600' },
  input: { backgroundColor: '#16213e', color: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 15 },
  btn: { backgroundColor: '#e94560', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

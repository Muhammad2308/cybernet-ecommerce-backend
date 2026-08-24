import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import { useRegister } from '../../hooks/useAuth'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

const ROLES = [
  { label: 'I want to send packages', value: 'SENDER' as const },
  { label: 'I am a traveler / driver', value: 'TRAVELER' as const },
  { label: 'I manage a fleet', value: 'LOGISTICS_ADMIN' as const },
]
type RegistrationRole = (typeof ROLES)[number]['value']

export function RegisterScreen({ navigation, route }: Props) {
  const initialRole = route.params?.role as RegistrationRole | undefined
  const [selectedRole, setSelectedRole] = useState<RegistrationRole | undefined>(initialRole)
  const [showForm, setShowForm] = useState(Boolean(initialRole))
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', fleet_invite_code: '' })
  const { mutate: register, isPending } = useRegister()

  const update = (key: keyof typeof form) => (val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleRegister = () => {
    if (!selectedRole) return
    if (!form.full_name || !form.email || !form.phone || !form.password) {
      return Alert.alert('Error', 'Please fill in all required fields')
    }
    register(
      { full_name: form.full_name, email: form.email, phone: form.phone, password: form.password, role: selectedRole, fleet_invite_code: form.fleet_invite_code || undefined },
      { onError: (err: any) => Alert.alert('Registration failed', err?.response?.data?.error ?? 'Unknown error') },
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!showForm ? (
        <>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={17} color="#e94560" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>GET STARTED</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Choose how you will use RIDO.</Text>

          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleList}>
            {ROLES.map((role) => (
              <TouchableOpacity key={role.value} style={[styles.roleCard, selectedRole === role.value && styles.roleCardActive]} onPress={() => setSelectedRole(role.value)} activeOpacity={0.8}>
                <Ionicons name={selectedRole === role.value ? 'radio-button-on' : 'radio-button-off'} size={21} color={selectedRole === role.value ? '#e94560' : '#727894'} style={styles.radio} />
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{role.label.replace('I want to ', '').replace('I am a ', '').replace('I manage ', '')}</Text>
                  <Text style={styles.roleDescription}>
                    {role.value === 'SENDER' ? 'Send packages with trusted travelers.' : role.value === 'TRAVELER' ? 'Carry packages along your journey.' : 'Coordinate drivers and deliveries.'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.btn, !selectedRole && styles.btnDisabled]} onPress={() => selectedRole && setShowForm(true)} disabled={!selectedRole}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowForm(false)}>
            <Ionicons name="arrow-back" size={17} color="#e94560" />
            <Text style={styles.backButtonText}>Back to account type</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>YOUR RIDO PROFILE</Text>
          <Text style={styles.title}>{ROLES.find((role) => role.value === selectedRole)?.label.replace('I want to ', '').replace('I am a ', '').replace('I manage ', '')}</Text>
          <Text style={styles.subtitle}>Tell us a little about yourself.</Text>

          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#8188a3" value={form.full_name} onChangeText={update('full_name')} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8188a3" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={update('email')} />
          <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#8188a3" keyboardType="phone-pad" value={form.phone} onChangeText={update('phone')} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8188a3" secureTextEntry value={form.password} onChangeText={update('password')} />
          {selectedRole === 'TRAVELER' && (
            <TextInput style={styles.input} placeholder="Fleet invite code (optional)" placeholderTextColor="#8188a3" value={form.fleet_invite_code} onChangeText={update('fleet_invite_code')} />
          )}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={isPending}>
            {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1a1a2e', padding: 24, paddingTop: 60, flexGrow: 1 },
  eyebrow: { color: '#e94560', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { color: '#9298b2', fontSize: 15, lineHeight: 22, marginBottom: 34 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 12 },
  roleList: { gap: 12 },
  roleCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#30334c', backgroundColor: '#202039' },
  roleCardActive: { borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.1)' },
  radio: { marginRight: 14 },
  roleCopy: { flex: 1 },
  roleTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  roleDescription: { color: '#9298b2', fontSize: 13, lineHeight: 19 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 34, paddingVertical: 4 },
  backButtonText: { color: '#e94560', fontSize: 14, fontWeight: '700' },
  input: { backgroundColor: '#16213e', color: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 15 },
  btn: { backgroundColor: '#e94560', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

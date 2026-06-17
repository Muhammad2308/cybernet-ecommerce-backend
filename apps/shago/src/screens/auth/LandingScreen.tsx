import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthNavigator'

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>

export function LandingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SHAGO</Text>
      <Text style={styles.tagline}>B2B Commerce, delivered fast.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.btnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => navigation.navigate('Register', {})}>
        <Text style={[styles.btnText, styles.btnTextOutline]}>Create Account</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 56, fontWeight: '900', color: '#e94560', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#aaa', marginBottom: 48 },
  btn: { width: '100%', backgroundColor: '#e94560', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#e94560' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnTextOutline: { color: '#e94560' },
})

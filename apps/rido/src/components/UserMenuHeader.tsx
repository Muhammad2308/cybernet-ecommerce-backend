import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLogout } from '../hooks/useAuth'

interface UserMenuHeaderProps {
  navigation: { navigate: (screen: string) => void }
  profileRoute: string
}

export function UserMenuHeader({ navigation, profileRoute }: UserMenuHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { mutate: logout } = useLogout()

  const openProfile = () => {
    setMenuOpen(false)
    navigation.navigate(profileRoute)
  }

  const signOut = () => {
    setMenuOpen(false)
    logout()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userButton} onPress={() => setMenuOpen((open) => !open)} activeOpacity={0.8} accessibilityLabel="Open user menu">
          <View style={styles.avatar}>
            <Ionicons name="person" size={19} color="#fff" />
          </View>
          <Ionicons name={menuOpen ? 'chevron-up' : 'chevron-down'} size={17} color="#9298b2" />
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={openProfile}>
              <Text style={styles.menuItemText}>Edit profile</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={signOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#1a1a2e' },
  header: { height: 64, paddingHorizontal: 18, justifyContent: 'center', position: 'relative', zIndex: 10 },
  userButton: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e94560', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  menu: { position: 'absolute', top: 57, right: 18, minWidth: 170, backgroundColor: '#252541', borderRadius: 10, borderWidth: 1, borderColor: '#3a3b59', paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  menuItem: { paddingHorizontal: 15, paddingVertical: 13 },
  menuItemText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  signOutText: { color: '#ff6b81', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#3a3b59' },
})
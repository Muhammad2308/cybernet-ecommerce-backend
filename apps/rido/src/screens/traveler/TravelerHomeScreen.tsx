import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native'
import { useAuthStore } from '../../store/auth.store'

const SHIPMENTS = [
  {
    id: 'S001',
    initials: 'KA',
    description: 'Electronics — 2kg',
    pickup: 'Wuse 2, Abuja',
    destination: 'Garki, Abuja',
    distance: '3.2km away',
    payout: '₦1,500',
  },
  {
    id: 'S002',
    initials: 'EB',
    description: 'Documents — 0.5kg',
    pickup: 'Maitama, Abuja',
    destination: 'Central Area, Abuja',
    distance: '5.1km away',
    payout: '₦800',
  },
  {
    id: 'S003',
    initials: 'TM',
    description: 'Clothing — 3kg',
    pickup: 'Gwarinpa, Abuja',
    destination: 'Kubwa, Abuja',
    distance: '7.8km away',
    payout: '₦2,200',
  },
]

const RECENT = [
  { id: 'R001', description: 'Groceries — 4kg', earnings: '₦1,800', date: 'Jun 16' },
  { id: 'R002', description: 'Books — 1.5kg', earnings: '₦950', date: 'Jun 15' },
]

export function TravelerHomeScreen() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.full_name?.split(' ')[0] ?? 'Emeka'
  const [available, setAvailable] = useState(true)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Ready to deliver, {firstName}? 🚀</Text>
          <Text style={styles.sub}>You have {SHIPMENTS.length} available shipments near you</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName[0]}</Text>
        </View>
      </View>

      {/* Availability Toggle */}
      <View style={styles.toggleCard}>
        <View>
          <Text style={styles.toggleLabel}>Available for Delivery</Text>
          <Text style={styles.toggleSub}>{available ? 'You are visible to senders' : 'You are offline'}</Text>
        </View>
        <Switch
          value={available}
          onValueChange={setAvailable}
          trackColor={{ false: '#374151', true: '#22c55e' }}
          thumbColor="#fff"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>₦12.4k</Text>
          <Text style={styles.statLabel}>Earned Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>4.8 ⭐</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Available Shipments */}
      <Text style={styles.sectionTitle}>Available Shipments Near You</Text>
      <View style={styles.shipmentList}>
        {SHIPMENTS.map((item) => (
          <View key={item.id} style={styles.shipmentCard}>
            <View style={styles.shipmentTop}>
              <View style={styles.senderAvatar}>
                <Text style={styles.senderInitials}>{item.initials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.shipmentDesc}>{item.description}</Text>
                <Text style={styles.shipmentDistance}>{item.distance}</Text>
              </View>
              <Text style={styles.payout}>{item.payout}</Text>
            </View>
            <View style={styles.routeRow}>
              <View style={styles.routeItem}>
                <Text style={styles.routeDot}>🟢</Text>
                <Text style={styles.routeText}>{item.pickup}</Text>
              </View>
              <View style={styles.routeItem}>
                <Text style={styles.routeDot}>🔴</Text>
                <Text style={styles.routeText}>{item.destination}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.acceptBtn}>
              <Text style={styles.acceptBtnText}>Accept Shipment</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Recent Deliveries */}
      <Text style={styles.sectionTitle}>Recent Deliveries</Text>
      <View style={styles.recentList}>
        {RECENT.map((item) => (
          <View key={item.id} style={styles.recentRow}>
            <Text style={styles.checkmark}>✅</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.recentDesc}>{item.description}</Text>
              <Text style={styles.recentDate}>{item.date}</Text>
            </View>
            <Text style={styles.recentEarnings}>{item.earnings}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8, gap: 12 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: '#94a3b8', marginTop: 4, fontSize: 13 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#4cc9f0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1a1a2e', fontWeight: '800', fontSize: 16 },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#16213e', marginHorizontal: 20, marginTop: 20, borderRadius: 14, padding: 16 },
  toggleLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  toggleSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#16213e', borderRadius: 12, padding: 14, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: '#94a3b8', fontSize: 10, marginTop: 3, textAlign: 'center' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  shipmentList: { marginHorizontal: 20, gap: 12 },
  shipmentCard: { backgroundColor: '#16213e', borderRadius: 14, padding: 16 },
  shipmentTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  senderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4cc9f0', justifyContent: 'center', alignItems: 'center' },
  senderInitials: { color: '#1a1a2e', fontWeight: '800', fontSize: 13 },
  shipmentDesc: { color: '#fff', fontSize: 13, fontWeight: '700' },
  shipmentDistance: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  payout: { color: '#22c55e', fontSize: 16, fontWeight: '800' },
  routeRow: { gap: 6, marginBottom: 14 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { fontSize: 10 },
  routeText: { color: '#94a3b8', fontSize: 12 },
  acceptBtn: { backgroundColor: '#4cc9f0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptBtnText: { color: '#1a1a2e', fontSize: 13, fontWeight: '800' },
  recentList: { marginHorizontal: 20, gap: 10 },
  recentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12, padding: 14 },
  checkmark: { fontSize: 18 },
  recentDesc: { color: '#fff', fontSize: 13, fontWeight: '600' },
  recentDate: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  recentEarnings: { color: '#22c55e', fontSize: 14, fontWeight: '800' },
})

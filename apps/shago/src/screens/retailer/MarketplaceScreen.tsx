import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { useAuthStore } from '../../store/auth.store'

const PRODUCTS = [
  { id: '1', name: 'Dangote Cement 50kg', price: '₦4,200', wholesaler: 'Alhaji Stores Ltd', unit: 'per bag' },
  { id: '2', name: 'Golden Penny Semovita 5kg', price: '₦3,800', wholesaler: 'Mega Foods Abuja', unit: 'per bag' },
  { id: '3', name: 'Indomie Instant Noodles (Carton)', price: '₦12,500', wholesaler: 'Sunrise Distributors', unit: 'per carton' },
  { id: '4', name: 'Peak Milk Tin 400g (Carton)', price: '₦28,000', wholesaler: 'FreshMart Wholesale', unit: 'per carton' },
]

const ORDERS = [
  { id: 'SHG-00412', status: 'Delivered', amount: '₦21,400', date: 'Jun 15' },
  { id: 'SHG-00398', status: 'Processing', amount: '₦8,700', date: 'Jun 16' },
  { id: 'SHG-00401', status: 'Pending', amount: '₦14,200', date: 'Jun 17' },
]

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#22c55e',
  Processing: '#f59e0b',
  Pending: '#6366f1',
}

export function MarketplaceScreen() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.full_name?.split(' ')[0] ?? 'Aisha'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
          <Text style={styles.sub}>Here's what's trending today</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName[0]}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search products, wholesalers...</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>3</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>₦48.5k</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      {/* Featured Products */}
      <Text style={styles.sectionTitle}>Featured Products</Text>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productEmoji}>📦</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
            <Text style={styles.productUnit}>{item.unit}</Text>
            <Text style={styles.productWholesaler} numberOfLines={1}>{item.wholesaler}</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Recent Orders */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <View style={styles.orderList}>
        {ORDERS.map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <View>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[order.status] + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>{order.status}</Text>
            </View>
            <Text style={styles.orderAmount}>{order.amount}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3460' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: '#94a3b8', marginTop: 4, fontSize: 13 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f5a623', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e4d8c', marginHorizontal: 20, marginTop: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchPlaceholder: { color: '#64748b', fontSize: 14 },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#1e4d8c', borderRadius: 12, padding: 14, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  productList: { paddingHorizontal: 20, gap: 12 },
  productCard: { backgroundColor: '#1e4d8c', borderRadius: 14, padding: 14, width: 160 },
  productImagePlaceholder: { backgroundColor: '#0f3460', borderRadius: 10, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  productEmoji: { fontSize: 32 },
  productName: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  productPrice: { color: '#f5a623', fontSize: 15, fontWeight: '800', marginTop: 6 },
  productUnit: { color: '#64748b', fontSize: 10, marginTop: 1 },
  productWholesaler: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  addBtn: { backgroundColor: '#f5a623', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  orderList: { marginHorizontal: 20, gap: 10 },
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e4d8c', borderRadius: 12, padding: 14 },
  orderId: { color: '#fff', fontSize: 13, fontWeight: '700' },
  orderDate: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  statusChip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderAmount: { color: '#fff', fontSize: 14, fontWeight: '800' },
})

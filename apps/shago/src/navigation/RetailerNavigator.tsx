import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { MarketplaceScreen } from '../screens/retailer/MarketplaceScreen'
import { MyOrdersScreen } from '../screens/retailer/MyOrdersScreen'
import { RetailerProfileScreen } from '../screens/retailer/RetailerProfileScreen'

const Tab = createBottomTabNavigator()

export function RetailerNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Profile" component={RetailerProfileScreen} />
    </Tab.Navigator>
  )
}

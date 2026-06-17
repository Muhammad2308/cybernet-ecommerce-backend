import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { WholesalerDashboardScreen } from '../screens/wholesaler/WholesalerDashboardScreen'
import { WholesalerOrdersScreen } from '../screens/wholesaler/WholesalerOrdersScreen'
import { WholesalerInventoryScreen } from '../screens/wholesaler/WholesalerInventoryScreen'
import { WholesalerProfileScreen } from '../screens/wholesaler/WholesalerProfileScreen'

const Tab = createBottomTabNavigator()

export function WholesalerNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={WholesalerDashboardScreen} />
      <Tab.Screen name="Orders" component={WholesalerOrdersScreen} />
      <Tab.Screen name="Inventory" component={WholesalerInventoryScreen} />
      <Tab.Screen name="Profile" component={WholesalerProfileScreen} />
    </Tab.Navigator>
  )
}

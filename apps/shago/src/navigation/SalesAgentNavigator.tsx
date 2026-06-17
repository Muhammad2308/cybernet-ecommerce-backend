import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { SalesAgentDashboardScreen } from '../screens/sales-agent/SalesAgentDashboardScreen'
import { SalesAgentOrdersScreen } from '../screens/sales-agent/SalesAgentOrdersScreen'
import { SalesAgentProfileScreen } from '../screens/sales-agent/SalesAgentProfileScreen'

const Tab = createBottomTabNavigator()

export function SalesAgentNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={SalesAgentDashboardScreen} />
      <Tab.Screen name="Orders" component={SalesAgentOrdersScreen} />
      <Tab.Screen name="Profile" component={SalesAgentProfileScreen} />
    </Tab.Navigator>
  )
}

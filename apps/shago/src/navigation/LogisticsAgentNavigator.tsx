import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { LogisticsHomeScreen } from '../screens/logistics/LogisticsHomeScreen'
import { ActiveJobScreen } from '../screens/logistics/ActiveJobScreen'
import { JobHistoryScreen } from '../screens/logistics/JobHistoryScreen'
import { LogisticsProfileScreen } from '../screens/logistics/LogisticsProfileScreen'

const Tab = createBottomTabNavigator()

export function LogisticsAgentNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={LogisticsHomeScreen} />
      <Tab.Screen name="Active" component={ActiveJobScreen} />
      <Tab.Screen name="History" component={JobHistoryScreen} />
      <Tab.Screen name="Profile" component={LogisticsProfileScreen} />
    </Tab.Navigator>
  )
}

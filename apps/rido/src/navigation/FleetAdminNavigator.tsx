import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { FleetDashboardScreen } from '../screens/fleet/FleetDashboardScreen'
import { DriversScreen } from '../screens/fleet/DriversScreen'
import { FleetEarningsScreen } from '../screens/fleet/FleetEarningsScreen'
import { FleetSettingsScreen } from '../screens/fleet/FleetSettingsScreen'
import { UserMenuHeader } from '../components/UserMenuHeader'

const Tab = createBottomTabNavigator()

export function FleetAdminNavigator() {
  return (
    <Tab.Navigator screenOptions={{ header: (props) => <UserMenuHeader navigation={props.navigation} profileRoute="Settings" /> }}>
      <Tab.Screen name="Dashboard" component={FleetDashboardScreen} />
      <Tab.Screen name="Drivers" component={DriversScreen} />
      <Tab.Screen name="Earnings" component={FleetEarningsScreen} />
      <Tab.Screen name="Settings" component={FleetSettingsScreen} />
    </Tab.Navigator>
  )
}

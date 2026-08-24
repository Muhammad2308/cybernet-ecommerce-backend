import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { TravelerHomeScreen } from '../screens/traveler/TravelerHomeScreen'
import { ActiveDeliveryScreen } from '../screens/traveler/ActiveDeliveryScreen'
import { EarningsScreen } from '../screens/traveler/EarningsScreen'
import { TravelerProfileScreen } from '../screens/traveler/TravelerProfileScreen'
import { UserMenuHeader } from '../components/UserMenuHeader'

const Tab = createBottomTabNavigator()

export function TravelerNavigator() {
  return (
    <Tab.Navigator screenOptions={{ header: (props) => <UserMenuHeader navigation={props.navigation} profileRoute="Profile" /> }}>
      <Tab.Screen name="Home" component={TravelerHomeScreen} />
      <Tab.Screen name="Active" component={ActiveDeliveryScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={TravelerProfileScreen} />
    </Tab.Navigator>
  )
}

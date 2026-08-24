import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { SenderHomeScreen } from '../screens/sender/SenderHomeScreen'
import { SendPackageScreen } from '../screens/sender/SendPackageScreen'
import { TrackShipmentScreen } from '../screens/sender/TrackShipmentScreen'
import { SenderProfileScreen } from '../screens/sender/SenderProfileScreen'
import { UserMenuHeader } from '../components/UserMenuHeader'

const Tab = createBottomTabNavigator()

export function SenderNavigator() {
  return (
    <Tab.Navigator screenOptions={{ header: (props) => <UserMenuHeader navigation={props.navigation} profileRoute="Profile" /> }}>
      <Tab.Screen name="Home" component={SenderHomeScreen} />
      <Tab.Screen name="Send" component={SendPackageScreen} />
      <Tab.Screen name="Track" component={TrackShipmentScreen} />
      <Tab.Screen name="Profile" component={SenderProfileScreen} />
    </Tab.Navigator>
  )
}

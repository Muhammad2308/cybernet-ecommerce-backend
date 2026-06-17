import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { SenderHomeScreen } from '../screens/sender/SenderHomeScreen'
import { SendPackageScreen } from '../screens/sender/SendPackageScreen'
import { TrackShipmentScreen } from '../screens/sender/TrackShipmentScreen'
import { SenderProfileScreen } from '../screens/sender/SenderProfileScreen'

const Tab = createBottomTabNavigator()

export function SenderNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={SenderHomeScreen} />
      <Tab.Screen name="Send" component={SendPackageScreen} />
      <Tab.Screen name="Track" component={TrackShipmentScreen} />
      <Tab.Screen name="Profile" component={SenderProfileScreen} />
    </Tab.Navigator>
  )
}

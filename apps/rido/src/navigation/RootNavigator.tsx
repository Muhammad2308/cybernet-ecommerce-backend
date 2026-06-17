import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../store/auth.store'

import { AuthNavigator } from './AuthNavigator'
import { SenderNavigator } from './SenderNavigator'
import { TravelerNavigator } from './TravelerNavigator'
import { FleetAdminNavigator } from './FleetAdminNavigator'

const Stack = createNativeStackNavigator()

export function RootNavigator() {
  const { user, token } = useAuthStore()

  if (!token || !user) {
    return <AuthNavigator />
  }

  switch (user.role) {
    case 'SENDER':
      return <SenderNavigator />
    case 'TRAVELER':
      return <TravelerNavigator />
    case 'LOGISTICS_ADMIN':
    case 'FLEET_ADMIN':
      return <FleetAdminNavigator />
    default:
      return <AuthNavigator />
  }
}

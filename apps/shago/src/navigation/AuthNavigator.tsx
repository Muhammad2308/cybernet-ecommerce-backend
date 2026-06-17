import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { LandingScreen } from '../screens/auth/LandingScreen'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'

export type AuthStackParamList = {
  Landing: undefined
  Login: undefined
  Register: { role?: 'RETAILER' | 'WHOLESALER' | 'SALES_AGENT' | 'LOGISTICS_AGENT' | 'CONSUMER' }
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

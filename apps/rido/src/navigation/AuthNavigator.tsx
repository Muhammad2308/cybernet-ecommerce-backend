import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { LandingScreen } from '../screens/auth/LandingScreen'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'

export type AuthStackParamList = {
  Landing: undefined
  Login: undefined
  Register: { role?: 'SENDER' | 'TRAVELER' | 'LOGISTICS_ADMIN' }
  ForgotPassword: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

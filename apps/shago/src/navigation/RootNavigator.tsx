import React from 'react'
import { useAuthStore } from '../store/auth.store'

import { AuthNavigator } from './AuthNavigator'
import { RetailerNavigator } from './RetailerNavigator'
import { WholesalerNavigator } from './WholesalerNavigator'
import { SalesAgentNavigator } from './SalesAgentNavigator'
import { LogisticsAgentNavigator } from './LogisticsAgentNavigator'

export function RootNavigator() {
  const { user, token } = useAuthStore()

  if (!token || !user) {
    return <AuthNavigator />
  }

  switch (user.role) {
    case 'RETAILER':
      return <RetailerNavigator />
    case 'WHOLESALER':
      return <WholesalerNavigator />
    case 'SALES_AGENT':
      return <SalesAgentNavigator />
    case 'LOGISTICS_AGENT':
      return <LogisticsAgentNavigator />
    default:
      return <AuthNavigator />
  }
}

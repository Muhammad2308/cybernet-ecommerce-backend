import { useMutation } from '@tanstack/react-query'
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async ({ data }) => {
      await setAuth(data.data.user, data.data.access_token)
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: async ({ data }) => {
      await setAuth(data.data.user, data.data.access_token)
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await clearAuth()
    },
  })
}

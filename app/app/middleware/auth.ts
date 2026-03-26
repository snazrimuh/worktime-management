/**
 * Protects all routes that require authentication.
 * Named middleware — applied per-page via definePageMeta({ middleware: 'auth' })
 *
 * The session is already hydrated + validated by the 01.auth.client plugin
 * before this middleware runs.
 */
export default defineNuxtRouteMiddleware(() => {
  // localStorage is only available on the client
  if (import.meta.server) return

  const authStore = useAuthStore()

  // If the session wasn't hydrated yet (edge case), try now
  if (!authStore.isSessionChecked) {
    authStore.hydrate()
  }

  // If the entire session (refresh token) has expired, clear and redirect
  if (authStore.isSessionExpired && authStore.refreshToken) {
    authStore.clear()
  }

  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})

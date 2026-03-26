/**
 * Hydrates the auth store from localStorage on every client-side app init.
 * Prefix "01" ensures this runs before other plugins and route middleware.
 *
 * Flow:
 * 1. Restore session data from localStorage (hydrate)
 * 2. If a session was found, validate it against the backend (/auth/me)
 * 3. If the access token is expired but refresh token is still valid,
 *    the store will automatically refresh the access token
 * 4. If everything fails, the session is cleared and user must log in
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const hasSession = authStore.hydrate()

  if (hasSession) {
    // Validate session in background — don't block navigation
    // but do await to ensure session status is accurate before route guards run
    await authStore.validateSession()
  }
})

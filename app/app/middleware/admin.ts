/**
 * Protects system-admin-only pages.
 * Named middleware — applied per-page via definePageMeta({ middleware: 'admin' })
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const isAdmin = authStore.user?.isSystemAdmin || authStore.user?.role === 'ADMIN'
  
  if (!authStore.isLoggedIn || !isAdmin) {
    return navigateTo('/dashboard')
  }
})

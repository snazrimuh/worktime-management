/**
 * Protects manager-and-above-only pages.
 * Named middleware — applied per-page via definePageMeta({ middleware: 'manager' })
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const isManagerOrAbove = authStore.user?.isSystemAdmin || 
                           authStore.user?.role === 'ADMIN' || 
                           authStore.user?.role === 'MANAGER'
  
  if (!authStore.isLoggedIn || !isManagerOrAbove) {
    return navigateTo('/dashboard')
  }
})

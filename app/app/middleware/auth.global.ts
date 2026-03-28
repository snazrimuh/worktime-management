/**
 * Protects all routes that require authentication.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const runtime = useRuntimeConfig()
  const host = import.meta.client ? window.location.host : useRequestHeaders(['host']).host

  // Local auth pages are retired in favor of Unified Portal.
  const retiredRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  if (retiredRoutes.includes(to.path)) {
    return navigateTo(`${runtime.public.hubUrl}${to.path}`, { external: true })
  }

  // HttpOnly cookie cannot be read directly on client, so validate once first.
  if (!authStore.isSessionChecked) {
    await Promise.race([
      authStore.validateSession(),
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 5000)
      }),
    ])
  }

  if (!authStore.isLoggedIn) {
    return navigateTo(runtime.public.hubUrl, { external: true })
  }
})

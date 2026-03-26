import { defineStore } from 'pinia'

export interface AuthUser {
  id: string
  name: string
  email: string
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  avatar?: string
  bio?: string
  department?: string
  isSystemAdmin: boolean
  createdAt?: string
}

interface AuthResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: AuthUser
  }
}

interface TokenRefreshResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}

interface PersistedSession {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  /** Unix timestamp (ms) when the access token expires */
  expiresAt: number | null
  /** Unix timestamp (ms) when the refresh token expires */
  refreshExpiresAt: number | null
}

const STORAGE_KEY = 'worktime_auth'

/** Default access token lifetime in ms (15 minutes). */
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000
/** Default refresh token lifetime in ms (7 days). */
const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000
/** Refresh the access token 2 minutes before it expires. */
const REFRESH_BUFFER_MS = 2 * 60 * 1000

let _refreshPromise: Promise<void> | null = null
let _refreshTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Try to decode the `exp` claim from a JWT.
 * Returns the expiry as a Unix timestamp in **milliseconds**, or `null` on failure.
 */
function decodeTokenExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload.exp === 'number') return payload.exp * 1000
    return null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    /** Unix timestamp (ms) when the current access token expires */
    expiresAt: null as number | null,
    /** Unix timestamp (ms) when the current refresh token expires */
    refreshExpiresAt: null as number | null,
    isLoading: false,
    /** Indicates whether the initial session check has completed */
    isSessionChecked: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.user,
    currentUser: (state) => state.user,

    /** True when the access token has expired (or is about to). */
    isAccessTokenExpired: (state) => {
      if (!state.expiresAt) return true
      return Date.now() >= state.expiresAt
    },

    /** True when the refresh token has also expired — no way to recover. */
    isSessionExpired: (state) => {
      if (!state.refreshExpiresAt) return true
      return Date.now() >= state.refreshExpiresAt
    },
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<AuthResponse>(
          `${config.public.apiBase}/auth/login`,
          { method: 'POST', body: { email, password } },
        )
        this._setSession(res.data.accessToken, res.data.refreshToken, res.data.user)
      } finally {
        this.isLoading = false
      }
    },

    async register(name: string, email: string, password: string) {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<AuthResponse>(
          `${config.public.apiBase}/auth/register`,
          { method: 'POST', body: { name, email, password } },
        )
        this._setSession(res.data.accessToken, res.data.refreshToken, res.data.user)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.accessToken) {
          const config = useRuntimeConfig()
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.accessToken}` },
          })
        }
      } catch { /* ignore errors during logout */ }
      this.clear()
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('No refresh token available')

      // If the refresh token itself has expired, clear everything
      if (this.isSessionExpired) {
        this.clear()
        throw new Error('Session expired')
      }

      if (_refreshPromise) return _refreshPromise

      _refreshPromise = (async () => {
        try {
          const config = useRuntimeConfig()
          const res = await $fetch<TokenRefreshResponse>(
            `${config.public.apiBase}/auth/refresh`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${this.refreshToken}` },
            },
          )
          this._setSession(res.data.accessToken, res.data.refreshToken, this.user!)
        } catch {
          // Refresh failed — session is dead
          this.clear()
          throw new Error('Session expired')
        } finally {
          _refreshPromise = null
        }
      })()

      return _refreshPromise
    },

    async forgotPassword(email: string) {
      const config = useRuntimeConfig()
      return $fetch(`${config.public.apiBase}/auth/forgot-password`, {
        method: 'POST',
        body: { email },
      })
    },

    async resetPassword(token: string, newPassword: string) {
      const config = useRuntimeConfig()
      return $fetch(`${config.public.apiBase}/auth/reset-password`, {
        method: 'POST',
        body: { token, newPassword },
      })
    },

    updateProfile(updates: Partial<AuthUser>) {
      if (this.user) {
        this.user = { ...this.user, ...updates }
        this._persist()
      }
    },

    /**
     * Restore session from localStorage.
     * Returns `true` if a valid (non-expired) session was restored.
     */
    hydrate(): boolean {
      if (!import.meta.client) return false
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          this.isSessionChecked = true
          return false
        }

        const stored: PersistedSession = JSON.parse(raw)

        // If the refresh token has expired, the session cannot be recovered
        if (stored.refreshExpiresAt && Date.now() >= stored.refreshExpiresAt) {
          localStorage.removeItem(STORAGE_KEY)
          this.isSessionChecked = true
          return false
        }

        this.user = stored.user ?? null
        this.accessToken = stored.accessToken ?? null
        this.refreshToken = stored.refreshToken ?? null
        this.expiresAt = stored.expiresAt ?? null
        this.refreshExpiresAt = stored.refreshExpiresAt ?? null

        // Schedule automatic token refresh
        this._scheduleRefresh()

        this.isSessionChecked = true
        return this.isLoggedIn
      } catch {
        this.isSessionChecked = true
        return false
      }
    },

    /**
     * Validate the current session against the backend.
     * If the access token has expired but the refresh token is still valid,
     * it will try to refresh first.
     */
    async validateSession(): Promise<boolean> {
      if (!this.isLoggedIn) return false

      try {
        // If access token expired, try to refresh first
        if (this.isAccessTokenExpired && !this.isSessionExpired) {
          await this.refresh()
        }

        // Verify with backend
        const config = useRuntimeConfig()
        const res = await $fetch<{ id: string; name: string; email: string }>(
          `${config.public.apiBase}/auth/me`,
          {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          },
        )

        // Update user profile from backend data (in case it changed)
        if (res) {
          const userData = (res as any).data ?? res
          this.user = { ...this.user!, ...userData }
          this._persist()
        }

        return true
      } catch {
        // Token is invalid on backend side — clear everything
        this.clear()
        return false
      }
    },

    clear() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.expiresAt = null
      this.refreshExpiresAt = null
      this.isSessionChecked = true
      this._clearRefreshTimer()
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    _setSession(accessToken: string, refreshToken: string, user: AuthUser) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user

      // Decode expiry from tokens or fall back to defaults
      this.expiresAt = decodeTokenExp(accessToken) ?? (Date.now() + ACCESS_TOKEN_LIFETIME_MS)
      this.refreshExpiresAt = decodeTokenExp(refreshToken) ?? (Date.now() + REFRESH_TOKEN_LIFETIME_MS)

      this._persist()
      this._scheduleRefresh()
    },

    _persist() {
      if (!import.meta.client) return
      const session: PersistedSession = {
        user: this.user,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: this.expiresAt,
        refreshExpiresAt: this.refreshExpiresAt,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    },

    /**
     * Schedule an automatic refresh of the access token before it expires.
     */
    _scheduleRefresh() {
      this._clearRefreshTimer()
      if (!this.expiresAt || !this.refreshToken) return

      const msUntilExpiry = this.expiresAt - Date.now()
      const msUntilRefresh = Math.max(msUntilExpiry - REFRESH_BUFFER_MS, 0)

      // Don't schedule if the refresh would be way too far in the future (> 30 min)
      // This avoids issues with setTimeout limits
      if (msUntilRefresh > 30 * 60 * 1000) return

      _refreshTimer = setTimeout(async () => {
        try {
          await this.refresh()
        } catch {
          // Refresh failed — session expired
        }
      }, msUntilRefresh)
    },

    _clearRefreshTimer() {
      if (_refreshTimer) {
        clearTimeout(_refreshTimer)
        _refreshTimer = null
      }
    },
  },
})

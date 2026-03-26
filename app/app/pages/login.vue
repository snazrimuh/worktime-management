<template>
  <div class="overflow-hidden rounded-[28px] border border-white/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1220]/88 shadow-[0_20px_70px_rgba(14,25,44,0.22)] dark:shadow-[0_22px_80px_rgba(2,6,23,0.55)] backdrop-blur-sm">
    <div class="grid lg:grid-cols-[1.05fr_1fr]">

      <!-- Visual panel -->
      <section class="relative hidden lg:flex min-h-[580px] overflow-hidden border-r border-slate-200/70 dark:border-white/[0.06] bg-[linear-gradient(170deg,#EEF4FF_0%,#E6EEF9_40%,#DDE7F6_100%)] dark:bg-[linear-gradient(170deg,#111C2F_0%,#0D1729_45%,#0A1324_100%)]">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-24 -left-14 h-64 w-64 rounded-full bg-[#7FA8F7]/28 blur-3xl dark:bg-[#3B82F6]/18" />
          <div class="absolute -bottom-14 -right-16 h-56 w-56 rounded-full bg-[#9CC2FF]/28 blur-3xl dark:bg-[#60A5FA]/16" />
        </div>

        <div class="relative z-10 flex w-full flex-col p-9">
          <div>
            <h2 class="max-w-sm text-[30px] leading-[1.15] font-bold text-[#0D1B2A] dark:text-[#ECF3FF]">
              Schedule smarter. Track attendance. Analyse performance.
            </h2>
            <p class="mt-4 max-w-sm text-sm text-[#3E5D86] dark:text-[#9EB7D8]">
              Worktime unifies work schedules, real-time attendance, and planned vs. actual reporting in one powerful platform.
            </p>
          </div>

          <!-- Mock UI preview -->
          <div class="mt-8 max-w-[560px]">
            <div class="relative overflow-hidden rounded-[26px] border border-[#ADC8F1]/45 bg-white/78 p-3 dark:border-[#355988]/45 dark:bg-[#0F1B31]/82 shadow-[0_14px_28px_rgba(20,56,107,0.16)] dark:shadow-[0_14px_30px_rgba(2,8,20,0.38)]">
              <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(80,130,214,0.16),transparent_45%),radial-gradient(circle_at_85%_78%,rgba(56,110,196,0.16),transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(74,141,232,0.12),transparent_45%),radial-gradient(circle_at_85%_78%,rgba(41,90,163,0.2),transparent_42%)]" />

              <div class="relative z-10 rounded-2xl bg-[#F4F8FF]/90 dark:bg-[#12243E]/88">
                <div class="h-9 flex items-center gap-2 px-3 border-b border-[#C8DCF8]/45 dark:border-[#29476E]/45">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#7FA8F7]" />
                  <span class="h-2.5 w-2.5 rounded-full bg-[#5C90DE]" />
                  <span class="h-2.5 w-2.5 rounded-full bg-[#3E72C0]" />
                  <p class="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4F6D99] dark:text-[#9EB7D8]">Worktime · Attendance Dashboard</p>
                </div>

                <div class="grid grid-cols-[78px_1fr_130px] min-h-[250px]">
                  <!-- Sidebar mock -->
                  <div class="p-2.5 space-y-2">
                    <div class="h-7 rounded-md bg-[#2C69C0]/90 dark:bg-[#2B5EA8]/85" />
                    <div class="h-7 rounded-md bg-[#1F4F92]/90 dark:bg-[#1E4A86]/85" />
                    <div class="h-7 rounded-md bg-[#367BDD]/90 dark:bg-[#326BC0]/85" />
                    <div class="mt-4 h-7 rounded-md bg-[#204E8E]/90 dark:bg-[#1E467B]/85" />
                  </div>

                  <!-- Main content mock -->
                  <div class="p-3 space-y-2.5">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4F6D99] dark:text-[#9EB7D8]">Today's Attendance</div>
                    <div class="grid grid-cols-3 gap-2">
                      <div class="space-y-1.5">
                        <div class="h-7 rounded-md bg-[#22C55E]/80 dark:bg-[#16A34A]/70" />
                        <div class="h-7 rounded-md bg-[#22C55E]/60 dark:bg-[#16A34A]/50" />
                      </div>
                      <div class="space-y-1.5">
                        <div class="h-7 rounded-md bg-[#F59E0B]/80 dark:bg-[#D97706]/70" />
                        <div class="h-7 rounded-md bg-[#EF4444]/70 dark:bg-[#DC2626]/60" />
                      </div>
                      <div class="space-y-1.5">
                        <div class="h-7 rounded-md bg-[#2E6DC5] dark:bg-[#295AA3]" />
                        <div class="h-7 rounded-md bg-[#3B82F6]/70 dark:bg-[#3278D8]/60" />
                      </div>
                    </div>

                    <div class="rounded-xl bg-[#DCEBFF]/70 dark:bg-[#163154]/70 p-2.5 space-y-1.5">
                      <div class="w-[78%] rounded-lg bg-[#22C55E]/90 px-2 py-1 text-[10px] font-medium text-white dark:bg-[#16A34A]/80">Ahmad checked in on time.</div>
                      <div class="ml-auto w-[70%] rounded-lg bg-[#F59E0B]/90 px-2 py-1 text-[10px] font-medium text-white dark:bg-[#D97706]/80">Siti arrived 12 min late.</div>
                    </div>
                  </div>

                  <!-- Right panel mock -->
                  <div class="p-3 space-y-2">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4F6D99] dark:text-[#9EB7D8]">On-Time Rate</p>
                    <div class="space-y-1.5">
                      <div class="h-2 rounded-full bg-[#22C55E]/80 dark:bg-[#16A34A]/70" style="width:88%" />
                      <div class="h-2 rounded-full bg-[#C8DCF8] dark:bg-[#1D3559]" />
                      <div class="h-2 rounded-full bg-[#F59E0B]/80 dark:bg-[#D97706]/70" style="width:60%" />
                      <div class="h-2 rounded-full bg-[#EF4444]/60 dark:bg-[#DC2626]/50" style="width:20%" />
                    </div>

                    <p class="pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4F6D99] dark:text-[#9EB7D8]">Shifts</p>
                    <div class="flex items-center -space-x-1.5">
                      <div class="h-6 w-6 rounded-full bg-[#2E6DC5]" />
                      <div class="h-6 w-6 rounded-full bg-[#22C55E]/80" />
                      <div class="h-6 w-6 rounded-full bg-[#F59E0B]/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Form panel -->
      <section class="p-6 sm:p-8 lg:p-10 bg-white/84 dark:bg-transparent">
        <div class="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 class="text-[36px] leading-none font-bold tracking-tight text-[#111827] dark:text-[#F3F8FF]">Welcome back</h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to your Worktime workspace.</p>
          </div>
          <p class="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-2">
            New here?
            <NuxtLink to="/register" class="font-semibold text-[#1B3A6B] dark:text-[#E0E1DD] hover:text-[#0F2347] dark:hover:text-white transition-colors">Sign Up Free</NuxtLink>
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div v-if="error" class="rounded-xl border border-rose-200/70 bg-rose-50/90 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300">
            {{ error }}
          </div>

          <div class="relative">
            <Mail class="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              v-model="email"
              type="email"
              placeholder="Email address"
              required
              class="h-12 w-full rounded-xl border border-slate-300/80 bg-slate-50/70 pl-10 pr-4 text-base font-semibold tracking-tight text-[#111827] placeholder:text-base placeholder:font-semibold placeholder:tracking-tight placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition dark:border-[#334155] dark:bg-[#121C2D] dark:text-[#E7F0FF] dark:placeholder:text-[#8FA6C7] dark:focus:border-[#778DA9]"
            />
          </div>

          <div class="relative">
            <Lock class="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              required
              class="h-12 w-full rounded-xl border border-slate-300/80 bg-slate-50/70 pl-10 pr-12 text-base font-semibold tracking-tight text-[#111827] placeholder:text-base placeholder:font-semibold placeholder:tracking-tight placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition dark:border-[#334155] dark:bg-[#121C2D] dark:text-[#E7F0FF] dark:placeholder:text-[#8FA6C7] dark:focus:border-[#778DA9]"
            />
            <button type="button" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>

          <div class="flex items-center justify-between gap-4 pt-0.5">
            <NuxtLink to="/forgot-password" class="text-sm font-semibold text-[#1B3A6B] dark:text-[#E0E1DD] hover:text-[#0F2347] dark:hover:text-white transition-colors">
              Forgot password?
            </NuxtLink>
            <NuxtLink to="/register" class="text-sm text-slate-500 dark:text-slate-400 sm:hidden">
              Sign up
            </NuxtLink>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="mt-1 h-12 w-full rounded-xl border border-[#1B3A6B]/85 bg-[#1B3A6B] text-base font-semibold text-white shadow-[0_8px_18px_rgba(10,22,36,0.35)] hover:bg-[#142C52] hover:shadow-[0_10px_22px_rgba(10,22,36,0.42)] active:bg-[#0F2040] transition disabled:opacity-60"
          >
            {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
          </button>

          <label class="mt-2 inline-flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400 select-none">
            <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-[#1B3A6B] focus:ring-[#1B3A6B]/30 dark:border-slate-600 dark:bg-[#111827]" />
            Keep me signed in
          </label>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isLoggedIn && !authStore.isSessionExpired) {
    navigateTo('/dashboard', { replace: true })
  }
})

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Invalid email or password'
  }
}
</script>

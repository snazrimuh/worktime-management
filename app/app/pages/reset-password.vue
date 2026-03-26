<template>
  <div class="overflow-hidden rounded-[28px] border border-white/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1220]/88 shadow-[0_20px_70px_rgba(14,25,44,0.22)] dark:shadow-[0_22px_80px_rgba(2,6,23,0.55)] backdrop-blur-sm">
    <div class="grid lg:grid-cols-[1.05fr_1fr]">
      <section class="relative hidden lg:flex min-h-[580px] overflow-hidden border-r border-slate-200/70 dark:border-white/[0.06] bg-[linear-gradient(170deg,#EDF5FF_0%,#E2EEFD_45%,#D9E7FB_100%)] dark:bg-[linear-gradient(170deg,#101B2E_0%,#0C1729_45%,#091323_100%)]">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-20 -left-14 h-64 w-64 rounded-full bg-[#7FA8F7]/30 blur-3xl dark:bg-[#3B82F6]/16" />
          <div class="absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[#9CC2FF]/30 blur-3xl dark:bg-[#60A5FA]/14" />
        </div>

        <div class="relative z-10 flex w-full flex-col justify-between p-9">
          <div>
            <h2 class="max-w-sm text-[30px] leading-[1.15] font-bold text-[#0D1B2A] dark:text-[#ECF3FF]">
              Secure your account with a new password.
            </h2>
            <p class="mt-4 max-w-sm text-sm text-[#3E5D86] dark:text-[#9EB7D8]">
              Choose a strong password to ensure your Worktime workforce data remains protected.
            </p>
          </div>

          <div class="max-w-md rounded-2xl border border-[#ADC8F1]/70 bg-white/78 p-4 dark:border-[#355988]/70 dark:bg-[#0F1B31]/82 shadow-[0_12px_24px_rgba(20,56,107,0.16)] dark:shadow-[0_12px_28px_rgba(2,8,20,0.35)]">
            <div class="space-y-2.5">
              <div class="h-10 rounded-lg bg-[#2C69C0]/90 dark:bg-[#2B5EA8]/85" />
              <div class="h-10 rounded-lg bg-[#367BDD]/90 dark:bg-[#326BC0]/85" />
            </div>
            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#C8DCF8] dark:bg-[#223B60]">
              <div class="h-full w-3/4 rounded-full bg-[#22C55E] dark:bg-[#16A34A]" />
            </div>
          </div>
        </div>
      </section>

      <section class="p-6 sm:p-8 lg:p-10 bg-white/84 dark:bg-transparent">
        <div class="mb-7">
          <h1 class="text-[36px] leading-none font-bold tracking-tight text-[#111827] dark:text-[#F3F8FF]">Reset password</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your new password below.</p>
        </div>

        <!-- Invalid / missing token state -->
        <div v-if="!token" class="space-y-4 text-center py-10">
          <p class="text-sm text-rose-600 dark:text-rose-400">Invalid or missing reset token.</p>
          <NuxtLink to="/forgot-password" class="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] dark:text-[#E0E1DD] hover:text-[#0F2347] dark:hover:text-white transition-colors">
            Request a new link
          </NuxtLink>
        </div>

        <!-- Success state -->
        <div v-else-if="success" class="space-y-5 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-5 dark:border-emerald-400/25 dark:bg-emerald-500/10 text-center">
          <div class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/70 bg-white text-emerald-600 dark:border-emerald-300/30 dark:bg-emerald-500/15 dark:text-emerald-300 mx-auto">
            <CheckCircle2 class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Password reset Successful</p>
            <p class="mt-1 text-sm text-emerald-700/90 dark:text-emerald-200/85">You can now sign in with your new password.</p>
          </div>
          <NuxtLink to="/login" class="block w-full text-center py-3 rounded-xl bg-[#1B3A6B] text-white font-semibold">Sign In</NuxtLink>
        </div>

        <!-- Reset form -->
        <form v-else class="space-y-4" @submit.prevent="handleReset">
          <div v-if="error" class="rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-400">
            {{ error }}
          </div>

          <div class="relative">
            <Lock class="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="New password"
              required
              class="h-12 w-full rounded-xl border border-slate-300/80 bg-slate-50/70 pl-10 pr-12 text-base font-semibold tracking-tight text-[#111827] placeholder:text-base placeholder:font-semibold placeholder:tracking-tight placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition dark:border-[#334155] dark:bg-[#121C2D] dark:text-[#E7F0FF] dark:placeholder:text-[#8FA6C7] dark:focus:border-[#778DA9]"
            />
            <button type="button" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>

          <div class="relative">
            <Lock class="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Confirm new password"
              required
              class="h-12 w-full rounded-xl border border-slate-300/80 bg-slate-50/70 pl-10 pr-12 text-base font-semibold tracking-tight text-[#111827] placeholder:text-base placeholder:font-semibold placeholder:tracking-tight placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition dark:border-[#334155] dark:bg-[#121C2D] dark:text-[#E7F0FF] dark:placeholder:text-[#8FA6C7] dark:focus:border-[#778DA9]"
            />
            <button type="button" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" @click="showConfirm = !showConfirm">
              <EyeOff v-if="showConfirm" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="mt-1 h-12 w-full rounded-xl border border-[#1B3A6B]/85 bg-[#1B3A6B] text-base font-semibold text-white shadow-[0_8px_18px_rgba(10,22,36,0.35)] hover:bg-[#142C52] hover:shadow-[0_10px_22px_rgba(10,22,36,0.42)] active:bg-[#0F2040] transition disabled:opacity-60"
          >
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="mt-6">
          <NuxtLink to="/login" class="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] dark:text-[#E0E1DD] hover:text-[#0F2347] dark:hover:text-white transition-colors">
            <ArrowLeft class="h-4 w-4" />
            Back to login
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const route = useRoute()

const token = computed(() => route.query.token as string | undefined)
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const success = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const handleReset = async () => {
  error.value = ''
  if (!token.value) return
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  isLoading.value = true
  try {
    await authStore.resetPassword(token.value, newPassword.value)
    success.value = true
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Invalid or expired reset token.'
  } finally {
    isLoading.value = false
  }
}
</script>

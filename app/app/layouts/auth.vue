<template>
  <div class="app-bg min-h-screen flex flex-col">
    <!-- Top bar -->
    <div class="h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/70 dark:border-white/[0.08] bg-[#F7FAFF]/85 dark:bg-[#0E1626]/80 backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="Worktime" class="h-8 w-8 rounded-xl" />
        <div class="leading-tight">
          <span class="font-bold text-[#1B2B4B] dark:text-[#D8E7FF] text-[20px] tracking-tight">Worktime</span>
          <span class="hidden sm:inline ml-2 text-xs text-slate-400 dark:text-slate-500 font-medium">Work Schedule & Attendance</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/login"
          :class="[
            'hidden sm:inline text-sm transition-colors',
            isLoginPage
              ? 'font-semibold text-[#1B3A6B] dark:text-[#E0E1DD]'
              : 'font-medium text-slate-500 dark:text-slate-400 hover:text-[#1B3A6B] dark:hover:text-white'
          ]"
        >Sign In</NuxtLink>
        <NuxtLink
          to="/register"
          :class="[
            'hidden sm:inline text-sm transition-colors',
            isRegisterPage
              ? 'font-semibold text-[#1B3A6B] dark:text-[#E0E1DD]'
              : 'font-medium text-slate-500 dark:text-slate-400 hover:text-[#1B3A6B] dark:hover:text-white'
          ]"
        >Sign Up</NuxtLink>

        <button
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-white/[0.08] transition-colors"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Card -->
    <div class="flex-1 flex items-center justify-center px-4 py-10">
      <div :class="authContainerClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const isLoginPage = computed(() => route.path === '/login' || route.path === '/forgot-password')
const isRegisterPage = computed(() => route.path === '/register')
const authContainerClass = computed(() => {
  if (route.path === '/login' || route.path === '/forgot-password' || route.path === '/register') {
    return 'w-full max-w-6xl'
  }
  return 'w-full max-w-md'
})
</script>

<template>
  <header class="glass-bar h-14 flex items-center justify-between px-6 sticky top-0 z-20">
    <div class="flex items-center gap-3">
      <button
        class="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-white/40 dark:hover:bg-white/[0.06] transition-colors"
        @click="$emit('toggleSidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>

      <div class="leading-tight">
        <p class="text-sm font-semibold text-slate-700 dark:text-white">{{ pageTitle }}</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400/90 hidden sm:block">{{ pageDescription }}</p>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <div ref="profileMenuRef" class="relative ml-1">
        <button
          class="group flex items-center gap-2 rounded-2xl pl-2 pr-2 py-1.5 hover:bg-white/50 dark:hover:bg-white/[0.07] ring-1 ring-transparent hover:ring-white/60 dark:hover:ring-white/[0.12] transition-all"
          @click="isProfileMenuOpen = !isProfileMenuOpen"
        >
          <div class="hidden sm:block text-right leading-tight min-w-0 max-w-[14rem]">
            <p class="text-[10px] uppercase tracking-wider text-sky-600/90 dark:text-sky-300/80 font-semibold truncate">{{ roleLabel }}</p>
            <p class="text-[14px] font-semibold text-slate-800 dark:text-slate-100 truncate">{{ currentUser.name }}</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ currentUser.email }}</p>
          </div>

          <UiAvatar :name="currentUser.name" :src="currentUser.avatar" size="sm" />
          <ChevronDown class="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform" :class="isProfileMenuOpen ? 'rotate-180' : ''" />
        </button>

        <Transition name="profile-menu">
          <div
            v-if="isProfileMenuOpen"
            class="absolute right-0 mt-2 w-56 rounded-2xl border border-white/70 dark:border-white/[0.1] bg-white/80 dark:bg-[#0F172A]/88 backdrop-blur-xl shadow-[0_14px_34px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_38px_rgba(2,6,23,0.46)] p-1.5 z-50"
          >
            <NuxtLink
              to="/profile"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-white/65 dark:hover:bg-white/[0.08] transition-colors"
              @click="isProfileMenuOpen = false"
            >
              <UserCog class="h-4.5 w-4.5" />
              <span>Manage Account</span>
            </NuxtLink>

            <button
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-sky-700 dark:text-sky-300 hover:bg-sky-50/90 dark:hover:bg-sky-500/10 transition-colors"
              @click="handleBackToPortal"
            >
              <LogOut class="h-4.5 w-4.5" />
              <span>Kembali ke Portal</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, ChevronDown, UserCog, LogOut } from 'lucide-vue-next'

interface Props {
  pageTitle?: string
  pageDescription?: string
}

withDefaults(defineProps<Props>(), {
  pageTitle: '',
  pageDescription: '',
})

defineEmits<{
  toggleSidebar: []
}>()

const authStore = useAuthStore()
const runtime = useRuntimeConfig()

const profileMenuRef = ref<HTMLElement | null>(null)
const isProfileMenuOpen = ref(false)

const currentUser = computed(() => authStore.user ?? { name: 'Guest User', email: 'guest@mail.com', avatar: '' })
const roleLabel = computed(() => {
  if (authStore.user?.isSystemAdmin) return 'Superadmin'
  const rawRole = ((authStore.user as (typeof authStore.user & { role?: string }))?.role ?? 'Employee').toString()
  if (rawRole.toUpperCase() === 'MANAGER') return 'Manager'
  if (rawRole.toUpperCase() === 'ADMIN') return 'Admin'
  return 'Employee'
})

const handleClickOutside = (event: MouseEvent) => {
  if (!profileMenuRef.value) return
  const target = event.target as Node
  if (!profileMenuRef.value.contains(target)) {
    isProfileMenuOpen.value = false
  }
}

const handleBackToPortal = () => {
  isProfileMenuOpen.value = false
  window.location.href = runtime.public.hubUrl ? `${runtime.public.hubUrl}/dashboard` : '/dashboard'
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.profile-menu-enter-active,
.profile-menu-leave-active {
  transition: opacity 160ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.profile-menu-enter-from,
.profile-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>

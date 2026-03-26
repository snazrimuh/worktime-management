<template>
  <aside
    :class="[
      'glass-panel h-screen fixed left-0 top-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-r border-white/55 dark:border-white/[0.1] bg-white/48 dark:bg-[#0B1220]/58 backdrop-blur-2xl shadow-[0_10px_30px_rgba(148,163,184,0.2)] dark:shadow-[0_20px_44px_rgba(2,6,23,0.45)]',
      isExpanded ? 'w-64' : 'w-20',
    ]"
  >
    <div class="h-full flex flex-col overflow-hidden">
      <!-- Branding / Top Section -->
      <div class="h-16 px-4 flex items-center shrink-0 border-b border-white/45 dark:border-white/[0.09]">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 group overflow-hidden">
          <img src="/logo.png" alt="Worktime" class="h-9 w-9 shrink-0" />
          <div v-if="isExpanded" class="leading-tight transition-all duration-300">
            <p class="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Worktime</p>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Workforce System</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
        <div v-for="group in visibleNavGroups" :key="group.key" class="space-y-1">
          <!-- Group Header -->
          <div v-if="isExpanded" class="px-3 mb-2 flex items-center justify-between">
            <p class="text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 font-bold">
              {{ group.label }}
            </p>
          </div>
          <div v-else class="flex justify-center mb-1">
             <div class="w-8 h-[1px] bg-slate-200 dark:bg-white/10" />
          </div>

          <!-- Group Items -->
          <nav class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.key"
              :to="item.path"
              :class="[
                'w-full flex items-center gap-3 rounded-xl transition-all ring-1',
                isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center',
                isPathActive(item.path)
                  ? 'bg-white/78 dark:bg-slate-300/[0.10] text-slate-900 dark:text-slate-100 font-semibold ring-white/80 dark:ring-white/[0.14] shadow-[0_8px_18px_rgba(15,23,42,0.12)]'
                  : 'ring-transparent text-slate-600 dark:text-slate-400 hover:bg-white/52 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-200 hover:ring-white/60 dark:hover:ring-white/[0.1]',
              ]"
              :title="!isExpanded ? item.label : ''"
            >
              <component :is="item.icon" :class="[isExpanded ? 'h-4.5 w-4.5' : 'h-5 w-5', 'shrink-0']" />
              <span v-if="isExpanded" class="text-[13px] truncate">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="p-3 shrink-0 border-t border-white/45 dark:border-white/[0.09] space-y-2">
        <button
          class="w-full h-10 flex items-center transition-all rounded-xl hover:bg-white/45 dark:hover:bg-white/[0.08]"
          :class="isExpanded ? 'px-3 gap-3' : 'justify-center'"
          @click="toggleSidebar"
        >
          <PanelLeft :class="['h-5 w-5 transition-transform duration-300', isExpanded ? '' : 'rotate-180']" />
          <span v-if="isExpanded" class="text-sm font-medium text-slate-600 dark:text-slate-300">Collapse</span>
        </button>

        <button
          class="w-full h-10 flex items-center transition-all rounded-xl hover:bg-white/45 dark:hover:bg-white/[0.08]"
          :class="isExpanded ? 'px-3 gap-3' : 'justify-center'"
          @click="toggleTheme"
        >
          <Moon v-if="!isDark" class="h-4.5 w-4.5" />
          <Sun v-else class="h-4.5 w-4.5" />
          <span v-if="isExpanded" class="text-sm font-medium text-slate-600 dark:text-slate-300">
            {{ isDark ? 'Light' : 'Dark' }} Mode
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  PanelLeft,
  House,
  Moon,
  Sun,
  Shield,
  ChartNoAxesColumn,
  LayoutDashboard,
  CalendarDays,
  Clock,
  CalendarClock,
  ArrowLeftRight,
  ClipboardCheck,
  ClipboardList,
  Users,
  Settings,
  BarChart3,
  Timer,
  CalendarRange,
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const isExpanded = useState<boolean>('sidebar-expanded', () => true)

type AppRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

interface NavItem {
  key: string
  label: string
  icon: any
  path: string
  roles?: readonly AppRole[]
}

interface NavGroup {
  key: string
  label: string
  items: readonly NavItem[]
  roles?: readonly AppRole[]
}

const currentRole = computed<AppRole>(() => {
  if (authStore.user?.isSystemAdmin) return 'ADMIN'
  const rawRole = ((authStore.user as (typeof authStore.user & { role?: string }))?.role ?? '')
    .toUpperCase()
    .replace(/\s+/g, '_')
  if (rawRole === 'ADMIN') return 'ADMIN'
  if (rawRole === 'MANAGER' || rawRole === 'HR') return 'MANAGER'
  return 'EMPLOYEE'
})

const navGroups: readonly NavGroup[] = [
  {
    key: 'home',
    label: 'Home',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    ],
  },
  {
    key: 'schedule',
    label: 'Schedule',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    items: [
      { key: 'schedules', label: 'Work Schedules', icon: CalendarRange, path: '/schedules', roles: ['ADMIN', 'MANAGER'] },
      { key: 'my-schedule', label: 'My Schedule', icon: CalendarDays, path: '/my-schedule', roles: ['EMPLOYEE'] },
      { key: 'assignments', label: 'Assignments', icon: ClipboardCheck, path: '/schedule-assignments', roles: ['ADMIN', 'MANAGER'] },
      { key: 'calendar', label: 'Calendar View', icon: CalendarClock, path: '/calendar', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    items: [
      { key: 'checkin', label: 'Check In / Out', icon: Timer, path: '/attendance/checkin', roles: ['EMPLOYEE'] },
      { key: 'attendance-log', label: 'Attendance Log', icon: ClipboardList, path: '/attendance', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { key: 'my-attendance', label: 'My Attendance', icon: ClipboardCheck, path: '/my-attendance', roles: ['EMPLOYEE'] },
    ],
  },
  {
    key: 'requests',
    label: 'Requests',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    items: [
      { key: 'my-requests', label: 'My Requests', icon: ClipboardList, path: '/requests', roles: ['EMPLOYEE'] },
      { key: 'shift-swap', label: 'Shift Swap', icon: ArrowLeftRight, path: '/requests/shift-swap', roles: ['EMPLOYEE'] },
      { key: 'approvals', label: 'Approvals', icon: ClipboardCheck, path: '/approvals', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    roles: ['ADMIN', 'MANAGER'],
    items: [
      { key: 'attendance-report', label: 'Attendance Report', icon: BarChart3, path: '/reports/attendance', roles: ['ADMIN', 'MANAGER'] },
      { key: 'adherence', label: 'Schedule Adherence', icon: ChartNoAxesColumn, path: '/reports/adherence', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    roles: ['ADMIN'],
    items: [
      { key: 'users', label: 'User Management', icon: Users, path: '/users', roles: ['ADMIN'] },
      { key: 'rule-config', label: 'Rules & Config', icon: Settings, path: '/config', roles: ['ADMIN'] },
    ],
  },
] as const

const roleAllows = (allowed?: readonly AppRole[]) => {
  if (!allowed || allowed.length === 0) return true
  return allowed.includes(currentRole.value)
}

const visibleNavGroups = computed(() =>
  navGroups
    .filter((group) => roleAllows(group.roles))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => roleAllows(item.roles)),
    }))
    .filter((group) => group.items.length > 0),
)

const isPathActive = (targetPath: string) => {
  const [pathOnly, queryString] = targetPath.split('?')
  const pathMatched = pathOnly === '/dashboard'
    ? route.path === '/dashboard'
    : route.path === pathOnly || route.path.startsWith(pathOnly + '/')

  if (!pathMatched) return false
  if (!queryString) return true

  const expectedQuery = new URLSearchParams(queryString)
  return Array.from(expectedQuery.entries()).every(([key, value]) => {
    const current = route.query[key]
    if (Array.isArray(current)) return current.includes(value)
    return current === value
  })
}

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 999px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
}
</style>

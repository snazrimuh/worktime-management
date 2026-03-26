<template>
  <div>
    <UiPageHeader
      title="Workforce Dashboard"
      :description="`Real-time overview for ${todayLabel}`"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 dark:text-slate-400 tabular-nums">Last updated: {{ lastUpdatedLabel }}</span>
          <UiButton size="sm" variant="outline" :loading="isLoading" @click="fetchDashboard">Refresh</UiButton>
        </div>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <div v-if="errorMessage" class="mb-4 rounded-xl border border-rose-200/50 bg-rose-50/50 p-4 text-sm text-rose-600 dark:border-rose-500/10 dark:bg-rose-500/5 dark:text-rose-400">
        {{ errorMessage }}
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UiCard v-for="item in kpiCards" :key="item.label" class="group p-6 transition-all border-none shadow-sm dark:shadow-md ring-1 ring-black/5 dark:ring-white/5 hover:ring-black/10 dark:hover:ring-white/10">
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between mb-1">
               <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{{ item.label }}</span>
               <component :is="item.icon" class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-primary-500" v-if="item.icon" />
            </div>
            <span class="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{{ item.value }}</span>
            <span class="mt-2 flex items-center gap-1.5 py-0.5 px-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] w-max">
               <span class="w-1.5 h-1.5 rounded-full" :class="item.dotClass" />
               <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ item.deltaLabel }}</span>
            </span>
          </div>
        </UiCard>
      </div>

      <!-- Detail Panels -->
      <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <UiCard class="xl:col-span-3 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 class="w-5 h-5 text-sky-500" />
              Attendance Status
            </h2>
            <UiBadge variant="secondary">Today</UiBadge>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1 py-2">
            <div v-for="row in statusRows" :key="row.label" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2.5">
                  <div class="w-2.5 h-2.5 rounded-full" :class="row.dotClass" />
                  <span class="font-semibold text-slate-600 dark:text-slate-300">{{ row.label }}</span>
                </div>
                <span class="font-bold text-slate-800 dark:text-white tabular-nums">{{ row.value }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                  :class="row.barClass"
                  :style="{ width: `${row.percent}%` }"
                />
              </div>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 text-right font-medium">{{ row.percent }}% of scheduled</p>
            </div>
          </div>
        </UiCard>

        <UiCard class="xl:col-span-2 p-6 overflow-hidden">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <CalendarClock class="w-5 h-5 text-amber-500" />
            Upcoming Shifts
          </h2>
          <div class="space-y-3">
             <div v-if="upcomingShifts.length === 0" class="py-10 text-center flex flex-col items-center gap-2">
               <div class="p-3 rounded-full bg-slate-50 dark:bg-slate-900">
                  <CalendarDays class="w-6 h-6 text-slate-300" />
               </div>
               <p class="text-xs text-slate-500 font-medium">No more shifts scheduled for today.</p>
             </div>
             <div
              v-for="shift in upcomingShifts"
              :key="shift.id"
              class="group flex items-center gap-3 rounded-xl border border-white/80 dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02] p-3 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-all duration-300"
            >
              <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <UserRound class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ shift.employeeName }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ shift.startTime }} – {{ shift.endTime }}</p>
              </div>
              <UiBadge variant="warning" class="shrink-0">{{ shift.type }}</UiBadge>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Activity & Action -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
        <UiCard class="p-6">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Activity class="w-5 h-5 text-emerald-500" />
            Live Activity
          </h2>
          <div class="space-y-3">
            <div
              v-for="log in recentAttendance"
              :key="log.id"
              class="flex items-center gap-3 px-1 py-1 group"
            >
              <div class="relative">
                <UiAvatar :name="log.employeeName" size="sm" />
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0E1523]" :class="log.statusVariant === 'success' ? 'bg-emerald-500' : 'bg-rose-500'" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{{ log.employeeName }}</p>
                  <span class="text-[10px] text-slate-400 tabular-nums">{{ log.checkIn }}</span>
                </div>
                <p class="text-xs text-slate-500 line-clamp-1">checked in at <strong>{{ log.checkIn }}</strong> (Schedule: {{ log.scheduledTime }})</p>
              </div>
            </div>
            <p v-if="recentAttendance.length === 0" class="text-sm text-slate-500 text-center py-6">Waiting for activity...</p>
          </div>
        </UiCard>

        <UiCard class="p-6">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <ClipboardCheck class="w-5 h-5 text-violet-500" />
            Pending Actions
          </h2>
          <div class="space-y-4">
             <div v-if="pendingApprovals.length === 0" class="py-10 text-center flex flex-col items-center gap-2">
               <div class="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/10">
                  <CheckCircle class="w-6 h-6 text-emerald-500" />
               </div>
               <p class="text-xs text-slate-500 font-medium">Workspace is clear. No pending requests.</p>
             </div>
             <NuxtLink
               v-for="item in pendingApprovals"
               :key="item.id"
               to="/approvals"
               class="flex items-center justify-between rounded-xl border border-white/60 dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02] p-4 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-sm transition-all"
             >
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 flex items-center justify-center rounded-lg" :class="item.variant === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-sky-50 dark:bg-sky-500/10 text-sky-600'">
                    <ClipboardList class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ item.type }}</p>
                    <p class="text-xs text-slate-500">{{ item.count }} pending requests</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-slate-300" />
             </NuxtLink>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarChart3,
  CalendarDays,
  CalendarClock,
  Activity,
  ClipboardCheck,
  UserRound,
  CheckCircle,
  ClipboardList,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Clock3,
  UsersRound
} from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const errorMessage = ref('')
const lastUpdatedAt = ref<Date | null>(null)

interface DashboardSummary {
  totalEmployees: number
  scheduledToday: number
  presentCount: number
  lateCount: number
  absentCount: number
  onLeaveCount: number
  onTimeRate: number
  pendingChangeRequests: number
  pendingSwapRequests: number
  upcomingShifts: Array<{
    id: string
    employeeName: string
    scheduleName: string
    startTime: string
    endTime: string
    type: string
  }>
  recentAttendance: Array<{
    id: string
    employeeName: string
    checkIn: string
    scheduledTime: string
    status: string
  }>
}

const summary = ref<DashboardSummary>({
  totalEmployees: 0,
  scheduledToday: 0,
  presentCount: 0,
  lateCount: 0,
  absentCount: 0,
  onLeaveCount: 0,
  onTimeRate: 0,
  pendingChangeRequests: 0,
  pendingSwapRequests: 0,
  upcomingShifts: [],
  recentAttendance: [],
})

const todayLabel = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const lastUpdatedLabel = computed(() => {
  if (!lastUpdatedAt.value) return 'Never'
  return lastUpdatedAt.value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const percent = (value: number, total: number) => {
  if (!total) return 0
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
}

const kpiCards = computed(() => [
  {
    label: 'Total Workforce',
    value: summary.value.totalEmployees.toLocaleString(),
    deltaLabel: `${summary.value.scheduledToday} scheduled`,
    dotClass: 'bg-primary-400',
    icon: UsersRound,
  },
  {
    label: 'Punctuality Rate',
    value: `${summary.value.onTimeRate.toFixed(1)}%`,
    deltaLabel: `${summary.value.presentCount} present now`,
    dotClass: 'bg-emerald-500',
    icon: UserCheck
  },
  {
    label: 'Late Intake',
    value: summary.value.lateCount.toLocaleString(),
    deltaLabel: `requires review`,
    dotClass: 'bg-amber-500',
    icon: Clock3
  },
  {
    label: 'Absenteeism',
    value: summary.value.absentCount.toLocaleString(),
    deltaLabel: `${summary.value.onLeaveCount} on leave`,
    dotClass: 'bg-rose-500',
    icon: AlertCircle
  },
])

const statusRows = computed(() => {
  const total = summary.value.scheduledToday || 1
  return [
    { label: 'On Time', value: summary.value.presentCount - summary.value.lateCount, percent: percent(summary.value.presentCount - summary.value.lateCount, total), barClass: 'bg-emerald-500/80', dotClass: 'bg-emerald-500' },
    { label: 'Late', value: summary.value.lateCount, percent: percent(summary.value.lateCount, total), barClass: 'bg-amber-500/80', dotClass: 'bg-amber-500' },
    { label: 'Absent', value: summary.value.absentCount, percent: percent(summary.value.absentCount, total), barClass: 'bg-rose-500/80', dotClass: 'bg-rose-500' },
    { label: 'On Leave', value: summary.value.onLeaveCount, percent: percent(summary.value.onLeaveCount, total), barClass: 'bg-sky-500/80', dotClass: 'bg-sky-500' },
  ]
})

const upcomingShifts = computed(() => summary.value.upcomingShifts)

const recentAttendance = computed(() =>
  summary.value.recentAttendance.map((log) => ({
    ...log,
    statusVariant: log.status === 'On Time' ? 'success' as const
      : log.status === 'Late' ? 'warning' as const
      : log.status === 'Absent' ? 'danger' as const
      : 'info' as const,
  })),
)

const pendingApprovals = computed(() => {
  const items = []
  if (summary.value.pendingChangeRequests > 0)
    items.push({ id: 'change', type: 'Schedule Change Requests', count: summary.value.pendingChangeRequests, variant: 'warning' as const })
  if (summary.value.pendingSwapRequests > 0)
    items.push({ id: 'swap', type: 'Shift Swap Requests', count: summary.value.pendingSwapRequests, variant: 'info' as const })
  return items
})

const fetchDashboard = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get<any>('/dashboard/summary')
    const data = (response as any)?.data ?? response
    Object.assign(summary.value, data)
    lastUpdatedAt.value = new Date()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Failed to load dashboard.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchDashboard()
})
</script>

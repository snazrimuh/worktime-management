<template>
  <div>
    <UiPageHeader
      title="My Attendance"
      description="View your personal clock-in history, work hours, and punctuality performance."
    >
      <template #actions>
        <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Period:</span>
            <input
              v-model="filterMonth"
              type="month"
              class="h-10 rounded-xl border-none bg-white dark:bg-white/[0.04] px-4 text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            />
        </div>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Performance Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UiCard v-for="stat in performanceStats" :key="stat.label" class="p-6 transition-all border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 bg-white dark:bg-white/[0.02]">
          <div class="flex flex-col items-center text-center">
            <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-2">{{ stat.label }}</span>
            <span class="text-3xl font-black tabular-nums tracking-tighter" :class="stat.color">{{ stat.value }}</span>
            <span v-if="stat.subLabel" class="text-[10px] text-slate-400 mt-1 font-medium">{{ stat.subLabel }}</span>
          </div>
        </UiCard>
      </div>

      <!-- History Table -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="px-6 py-4 flex items-center justify-between border-b border-slate-50 dark:border-white/[0.05]">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Clock-in History</h3>
          <span class="text-[10px] font-bold text-slate-400 tabular-nums">Showing results for selected month</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Day & Date</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Target Policy</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Check In</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Check Out</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Duration</th>
                <th class="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-16 text-center text-slate-400 dark:text-slate-600 font-bold italic animate-pulse">Syncing personal records...</td>
              </tr>
              <tr v-else-if="records.length === 0">
                <td colspan="6" class="px-6 py-20 text-center">
                   <div class="flex flex-col items-center gap-2 opacity-50">
                    <ListFilter class="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <p class="text-xs font-semibold text-slate-400">No activity logged for this period.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="r in records"
                :key="r.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="text-slate-900 dark:text-white font-bold">{{ formatDate(r.date) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ r.scheduleName }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">{{ r.checkIn ?? '—:—' }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">{{ r.checkOut ?? '—:—' }}</span>
                </td>
                <td class="px-6 py-4 text-center font-mono text-xs tabular-nums text-slate-500">
                  {{ r.duration ?? '—' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <UiBadge :variant="statusVariant(r.status)" class="font-black px-2 py-0.5 text-[10px] uppercase tracking-tighter">{{ r.status }}</UiBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListFilter } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const records = ref<any[]>([])
const filterMonth = ref(new Date().toISOString().slice(0, 7))

const performanceStats = computed(() => {
  const total = records.value.length
  const onTime = records.value.filter(r => r.status === 'ON_TIME').length
  const late = records.value.filter(r => r.status === 'LATE').length
  const absent = records.value.filter(r => r.status === 'ABSENT').length
  
  return [
    { label: 'Total Logs', value: total, color: 'text-slate-900 dark:text-white', subLabel: 'Expected shifts' },
    { label: 'On Time', value: onTime, color: 'text-emerald-500', subLabel: 'Punctual' },
    { label: 'Late', value: late, color: 'text-amber-500', subLabel: 'Attention needed' },
    { label: 'Absent', value: absent, color: 'text-rose-500', subLabel: 'No clock-in' },
  ]
})

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const statusVariant = (s: string) => {
  if (s === 'ON_TIME') return 'success' as const
  if (s === 'LATE') return 'warning' as const
  if (s === 'ABSENT') return 'danger' as const
  if (s === 'EARLY_LEAVE') return 'warning' as const
  return 'default' as const
}

const fetchRecords = async () => {
  isLoading.value = true
  try {
    const res = await api.get<any>(`/attendance/my?month=${filterMonth.value}`)
    records.value = (res as any)?.data ?? res ?? []
  } catch {}
  isLoading.value = false
}

watch(filterMonth, fetchRecords)
onMounted(fetchRecords)
</script>

<template>
  <div>
    <UiPageHeader
      title="Attendance Report"
      description="Monthly consolidation of employee attendance, working hours, and status summary."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Period:</span>
          <input
            v-model="filterMonth"
            type="month"
            class="h-10 rounded-xl border-none bg-white dark:bg-white/[0.04] px-4 text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
          />
          <UiButton size="sm" variant="outline" class="ml-2" @click="exportReport">
            <Download class="w-4 h-4 mr-2" />
            Export CSV
          </UiButton>
        </div>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Summary KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <UiCard v-for="stat in summaryStats" :key="stat.label" class="p-5 flex flex-col items-center justify-center text-center border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-all">
          <p class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-2">{{ stat.label }}</p>
          <p class="text-3xl font-black tabular-nums tracking-tight" :class="stat.color">{{ stat.value }}</p>
          <p v-if="stat.subLabel" class="text-[10px] text-slate-400 mt-1 font-medium">{{ stat.subLabel }}</p>
        </UiCard>
      </div>

      <!-- Filters Toolbar -->
      <UiCard class="p-4 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="relative w-full md:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Filter by employee name..."
              class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Status:</span>
            <UiSelect v-model="filterStatus" :options="statusOptions" class="h-10 text-sm md:w-48" />
          </div>
        </div>
      </UiCard>

      <!-- Results Table -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Employee</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Date</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Clock In</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Clock Out</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Duration</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-20 text-center">
                   <div class="flex flex-col items-center gap-3">
                     <FileSpreadsheet class="w-8 h-8 text-slate-200 dark:text-slate-800 animate-pulse" />
                     <span class="text-xs font-semibold uppercase tracking-widest text-slate-400">Compiling Report Data...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredRows.length === 0">
                <td colspan="6" class="px-6 py-20 text-center text-slate-400 dark:text-slate-500 font-medium italic">
                  No records found for the selected period and criteria.
                </td>
              </tr>
              <tr
                v-for="r in filteredRows"
                :key="r.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :name="r.employeeName" size="sm" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white leading-tight">{{ r.employeeName }}</span>
                      <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ r.department }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-slate-600 dark:text-slate-300 font-medium">{{ formatDate(r.date) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">{{ r.checkIn ?? '—:—' }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">{{ r.checkOut ?? '—:—' }}</span>
                </td>
                <td class="px-6 py-4 text-center font-mono text-xs tabular-nums text-slate-500">
                  {{ r.duration ?? '—' }}
                </td>
                <td class="px-6 py-4">
                  <UiBadge :variant="statusVariant(r.status)" class="font-black px-2 py-0.5 text-[10px]">{{ r.status.replace('_', ' ') }}</UiBadge>
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
import { Download, Search, FileSpreadsheet } from 'lucide-vue-next'

definePageMeta({ middleware: 'manager' })

const api = useApi()
const isLoading = ref(false)
const search = ref('')
const filterMonth = ref(new Date().toISOString().slice(0, 7))
const filterStatus = ref('')
const rows = ref<any[]>([])

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'ON_TIME', label: 'On Time' },
  { value: 'LATE', label: 'Late' },
  { value: 'EARLY_LEAVE', label: 'Early Leave' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'OVERTIME', label: 'Overtime' },
]

const filteredRows = computed(() =>
  rows.value.filter((r) => {
    const nameMatch = r.employeeName?.toLowerCase().includes(search.value.toLowerCase())
    const statusMatch = !filterStatus.value || r.status === filterStatus.value
    return nameMatch && statusMatch
  }),
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const statusVariant = (s: string) => {
  if (s === 'ON_TIME') return 'success' as const
  if (s === 'LATE') return 'warning' as const
  if (s === 'ABSENT') return 'danger' as const
  if (s === 'EARLY_LEAVE') return 'warning' as const
  if (s === 'OVERTIME') return 'info' as const
  return 'default' as const
}

const summaryStats = computed(() => {
  const total = rows.value.length
  const onTime = rows.value.filter(r => r.status === 'ON_TIME').length
  const late = rows.value.filter(r => r.status === 'LATE').length
  const absent = rows.value.filter(r => r.status === 'ABSENT').length
  const overtime = rows.value.filter(r => r.status === 'OVERTIME').length
  
  return [
    { label: 'Total Logs', value: total, color: 'text-slate-900 dark:text-white', subLabel: 'Records this month' },
    { label: 'On Time', value: onTime, color: 'text-emerald-500', subLabel: `${percent(onTime, total)}% rate` },
    { label: 'Late', value: late, color: 'text-amber-500', subLabel: `${percent(late, total)}% rate` },
    { label: 'Absent', value: absent, color: 'text-rose-500', subLabel: `${percent(absent, total)}% rate` },
    { label: 'Overtime', value: overtime, color: 'text-sky-500', subLabel: 'Extra hours' },
  ]
})

const percent = (v: number, t: number) => t ? Math.round((v / t) * 100) : 0

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get<any>(`/reports/attendance?month=${filterMonth.value}`)
    const data = (res as any)?.data ?? res
    rows.value = data?.logs ?? []
  } catch {}
  isLoading.value = false
}

const exportReport = () => {
  alert('Exporting records for ' + filterMonth.value + ' to CSV...')
}

watch(filterMonth, fetchData)
onMounted(fetchData)
</script>

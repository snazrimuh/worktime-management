<template>
  <div>
    <UiPageHeader
      title="Adherence Analysis"
      description="Track long-term workforce punctuality and attendance reliability scores."
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
      <!-- Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UiCard v-for="stat in summaryStats" :key="stat.label" class="p-6 transition-all border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
          <div class="flex flex-col items-center text-center">
            <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-2">{{ stat.label }}</span>
            <span class="text-3xl font-black tabular-nums tracking-tighter" :class="stat.color">{{ stat.value }}</span>
            <div class="mt-3 w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden" v-if="stat.percent !== undefined">
               <div class="h-full rounded-full transition-all duration-1000" :class="stat.barColor" :style="{ width: `${stat.percent}%` }" />
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Toolbar -->
      <UiCard class="p-4 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="relative w-full md:w-80">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search employee or department..."
            class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
      </UiCard>

      <!-- Analysis Table -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Employee</th>
                <th class="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Scheduled</th>
                <th class="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-emerald-500">On Time</th>
                <th class="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-amber-500">Late</th>
                <th class="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-rose-500">Absent</th>
                <th class="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Reliability Score</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-20 text-center">
                   <div class="flex flex-col items-center gap-3">
                     <TrendingUp class="w-8 h-8 text-slate-200 dark:text-slate-800 animate-bounce" />
                     <span class="text-xs font-semibold uppercase tracking-widest text-slate-400">Calculating Scores...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredRows.length === 0">
                <td colspan="6" class="px-6 py-20 text-center text-slate-400 dark:text-slate-500 font-medium italic">
                  No data available for the selected month.
                </td>
              </tr>
              <tr
                v-for="row in filteredRows"
                :key="row.employeeId"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :name="row.employeeName" size="sm" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white leading-tight">{{ row.employeeName }}</span>
                      <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ row.department }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-200 tabular-nums">{{ row.scheduled }}</td>
                <td class="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ row.onTime }}</td>
                <td class="px-6 py-4 text-center font-bold text-amber-600 dark:text-amber-400 tabular-nums">{{ row.late }}</td>
                <td class="px-6 py-4 text-center font-bold text-rose-600 dark:text-rose-400 tabular-nums">{{ row.absent }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex flex-col items-end gap-1">
                    <span class="text-sm font-black tracking-tight" :class="row.adherenceRate >= 90 ? 'text-emerald-500' : row.adherenceRate >= 75 ? 'text-amber-500' : 'text-rose-500'">
                      {{ row.adherenceRate.toFixed(1) }}%
                    </span>
                    <div class="w-20 h-1 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                       <div class="h-full rounded-full" :class="row.adherenceRate >= 90 ? 'bg-emerald-500' : row.adherenceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'" :style="{ width: `${row.adherenceRate}%` }" />
                    </div>
                  </div>
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
import { TrendingUp, Search } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const search = ref('')
const filterMonth = ref(new Date().toISOString().slice(0, 7))
const rows = ref<any[]>([])

const filteredRows = computed(() =>
  rows.value.filter((r) =>
    r.employeeName?.toLowerCase().includes(search.value.toLowerCase()) ||
    r.department?.toLowerCase().includes(search.value.toLowerCase())
  ),
)

const summaryStats = computed(() => {
  const totalScheduled = rows.value.reduce((s, r) => s + r.scheduled, 0)
  const totalOnTime = rows.value.reduce((s, r) => s + r.onTime, 0)
  const avgAdherence = rows.value.length ? rows.value.reduce((s, r) => s + r.adherenceRate, 0) / rows.value.length : 0
  
  return [
    { label: 'Total Scheduled', value: totalScheduled, color: 'text-slate-900 dark:text-white' },
    { label: 'Punctual Shifts', value: totalOnTime, color: 'text-emerald-500', percent: totalScheduled ? (totalOnTime / totalScheduled) * 100 : 0, barColor: 'bg-emerald-500' },
    { label: 'Avg Reliability', value: `${avgAdherence.toFixed(1)}%`, color: avgAdherence >= 90 ? 'text-emerald-500' : 'text-amber-500', percent: avgAdherence, barColor: avgAdherence >= 90 ? 'bg-emerald-500' : 'bg-amber-500' },
    { label: 'Total Employees', value: rows.value.length, color: 'text-sky-500' },
  ]
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get<any>(`/reports/adherence?month=${filterMonth.value}`)
    rows.value = (res as any)?.data ?? res ?? []
  } catch {}
  isLoading.value = false
}

watch(filterMonth, fetchData)
onMounted(fetchData)
</script>

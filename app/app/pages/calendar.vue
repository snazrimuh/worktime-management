<template>
  <div>
    <UiPageHeader
      title="Calendar View"
      description="Visual monthly schedule and attendance tracking for the entire workforce."
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <div class="flex items-center glass-subtle rounded-xl p-1 shadow-sm ring-1 ring-black/5">
            <button class="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/[0.08] text-slate-500 transition-all" @click="prevMonth">
              <ChevronLeft class="h-4 w-4" />
            </button>
            <span class="px-4 text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[120px] text-center shrink-0">{{ calendarTitle }}</span>
            <button class="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/[0.08] text-slate-500 transition-all" @click="nextMonth">
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
          <input v-model="filterMonth" type="month" class="h-10 rounded-xl border-none bg-white dark:bg-white/[0.04] px-4 text-xs font-bold shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer" />
        </div>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Search Toolbar -->
      <UiCard class="p-4 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="relative w-full md:w-80">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Highlight employee in calendar..."
            class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
      </UiCard>

      <!-- Calendar Grid -->
      <UiCard class="p-1 border-none shadow-xl ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
        <div class="grid grid-cols-7 border-b border-slate-100 dark:border-white/[0.05]">
          <div v-for="day in dayLabels" :key="day" class="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 bg-slate-50/50 dark:bg-white/[0.01]">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            :class="[
              'min-h-[110px] md:min-h-[140px] p-2 border-r border-b border-slate-100 dark:border-white/[0.04] transition-all relative group',
              cell.isCurrentMonth ? '' : 'bg-slate-100/30 dark:bg-black/10 opacity-40',
              idx % 7 === 6 ? 'border-r-0' : '',
              cell.isToday ? 'bg-sky-50/30 dark:bg-sky-500/[0.03]' : '',
            ]"
          >
            <!-- Day number -->
            <div class="flex justify-between items-start mb-2">
              <span 
                :class="[
                  'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                  cell.isToday ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'text-slate-400 dark:text-slate-600',
                  cell.isCurrentMonth && !cell.isToday ? 'group-hover:text-slate-600 dark:group-hover:text-slate-300' : ''
                ]"
              >
                {{ cell.day }}
              </span>
              <span v-if="cell.entries.length > 0 && cell.isCurrentMonth" class="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase">{{ cell.entries.length }} active</span>
            </div>

            <!-- Entries -->
            <div class="space-y-1">
              <div
                v-for="entry in cell.entries.slice(0, 4)"
                :key="entry.id"
                :class="[
                  'text-[10px] font-bold px-2 py-1 rounded-lg truncate ring-1 transition-all hover:scale-[1.02] cursor-default',
                  entry.color
                ]"
              >
                {{ entry.label }}
              </div>
              <div v-if="cell.entries.length > 4" class="text-[9px] font-extrabold text-center py-0.5 text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-white/[0.04] rounded-md">
                +{{ cell.entries.length - 4 }} OTHERS
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Legend -->
      <div class="flex flex-wrap items-center justify-center gap-6 py-4">
        <div v-for="(color, status) in legendItems" :key="status" class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full" :class="color" />
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ status.replace('_', ' ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const search = ref('')
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const filterMonth = computed({
  get: () => `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`,
  set: (val: string) => {
    if (!val) return
    const parts = val.split('-').map(Number)
    if (parts.length < 2) return
    const [year, m] = parts
    if (year === undefined || m === undefined) return
    currentYear.value = year
    currentMonth.value = m - 1
  },
})

const calendarTitle = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
)

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const attendanceData = ref<Record<string, any[]>>({})

const calendarCells = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const cells = []

  // Prev month padded days
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false, isToday: false, entries: [] })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = dateStr === today.toISOString().slice(0, 10)
    const entries = (attendanceData.value[dateStr] ?? []).filter((e) =>
      !search.value || e.label.toLowerCase().includes(search.value.toLowerCase()),
    )
    cells.push({ day: d, isCurrentMonth: true, isToday, entries })
  }

  // Next month padded days
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, isToday: false, entries: [] })
  }

  return cells
})

const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else { currentMonth.value-- }
}
const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else { currentMonth.value++ }
}

const colorMap: Record<string, string> = {
  ON_TIME: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
  LATE: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  ABSENT: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20',
  SHIFT: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20',
}

const legendItems = {
  'On Time': 'bg-emerald-500',
  'Late': 'bg-amber-500',
  'Absent': 'bg-rose-500',
  'Scheduled': 'bg-sky-500'
}

const fetchCalendarData = async () => {
  try {
    const res = await api.get<any>(`/attendance/calendar?month=${filterMonth.value}`)
    const raw: any[] = (res as any)?.data ?? res ?? []
    const grouped: Record<string, any[]> = {}
    for (const entry of raw) {
      if (!entry || !entry.date) continue
      if (!grouped[entry.date]) {
        grouped[entry.date] = []
      }
      grouped[entry.date]!.push({
        id: entry.id,
        label: entry.employeeName ?? entry.scheduleName,
        color: colorMap[entry.status] ?? 'bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-white/10',
      })
    }
    attendanceData.value = grouped
  } catch {}
}

watch([currentYear, currentMonth], fetchCalendarData)
onMounted(fetchCalendarData)
</script>

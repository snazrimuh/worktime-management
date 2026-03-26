<template>
  <div>
    <UiPageHeader
      title="Attendance Log"
      description="Monitor and manage employee daily clock-in/out records and adherence."
    >
      <template #actions>
        <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Date:</span>
            <input
              v-model="filterDate"
              type="date"
              class="h-10 rounded-xl border-none bg-white dark:bg-white/[0.04] px-4 text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            />
        </div>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Filters Toolbar -->
      <UiCard class="p-4 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="relative w-full md:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search by employee name..."
              class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div class="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
               v-for="opt in statusFilterOptions"
               :key="opt.value"
               class="px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border"
               :class="filterStatus === opt.value
                 ? 'bg-sky-500 border-sky-500 text-white shadow-md'
                 : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.1] text-slate-500 hover:border-slate-300 dark:hover:border-white/20'"
               @click="filterStatus = opt.value"
            >
              {{ opt.label }}
            </button>
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
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Day & Date</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Schedule</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Clock In</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Clock Out</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Duration</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Status</th>
                <th class="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading" class="animate-pulse">
                <td colspan="8" class="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                  <div class="flex flex-col items-center gap-3">
                     <Clock4 class="w-8 h-8 text-slate-200 dark:text-slate-800 animate-spin-slow" />
                     <span class="text-xs font-semibold uppercase tracking-widest text-slate-300">Syncing Records...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredAttendance.length === 0">
                <td colspan="8" class="px-6 py-20 text-center text-slate-400 dark:text-slate-500 font-medium italic">
                  No attendance records found for this criteria.
                </td>
              </tr>
              <tr
                v-for="record in filteredAttendance"
                :key="record.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :name="record.employeeName" size="sm" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white leading-tight">{{ record.employeeName }}</span>
                      <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ record.department }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-slate-600 dark:text-slate-300 font-medium">{{ formatDate(record.date) }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                   <UiBadge variant="secondary" class="font-bold text-[10px]">{{ record.scheduleName }}</UiBadge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">
                    <LogIn class="w-3 h-3 text-emerald-500" v-if="record.checkIn" />
                    {{ record.checkIn ?? '—:—' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">
                    <LogOut class="w-3 h-3 text-amber-500" v-if="record.checkOut" />
                    {{ record.checkOut ?? '—:—' }}
                  </div>
                </td>
                <td class="px-6 py-4 font-mono text-xs tabular-nums text-slate-500">
                  {{ record.duration ?? '—' }}
                </td>
                <td class="px-6 py-4 text-left">
                  <UiBadge :variant="statusVariant(record.status)" class="font-black px-2 py-0.5 text-[10px]">{{ record.status.replace('_', ' ') }}</UiBadge>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-700 dark:hover:text-amber-400 transition-all"
                    title="Manual Adjustment"
                    @click="openAdjust(record)"
                  >
                    <SlidersHorizontal class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- Manual Adjustment Modal -->
    <UiModal v-model="showAdjustModal" title="Adjust Attendance Record" size="md">
      <div v-if="adjustingRecord" class="space-y-6">
        <div class="flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-4 border border-slate-100 dark:border-white/[0.06]">
           <UiAvatar :name="adjustingRecord.employeeName" size="lg" />
           <div>
             <p class="font-bold text-slate-900 dark:text-white">{{ adjustingRecord.employeeName }}</p>
             <p class="text-sm text-slate-500 font-medium">{{ formatDate(adjustingRecord.date) }} · {{ adjustingRecord.scheduleName }}</p>
           </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UiInput v-model="adjustForm.checkIn" label="Manual Check-In" type="time" />
          <UiInput v-model="adjustForm.checkOut" label="Manual Check-Out" type="time" />
        </div>

        <UiSelect v-model="adjustForm.status" label="Override Status Reason" :options="statusFilterOptions.filter(o => o.value !== '')" />

        <UiTextarea v-model="adjustForm.reason" label="Adjustment Rationale" placeholder="Describe why this change was made (e.g., system failure, manual override)" rows="3" />

        <div class="flex items-center justify-end gap-3 pt-2">
          <UiButton type="button" variant="outline" @click="showAdjustModal = false" class="px-6">Cancel</UiButton>
          <UiButton :loading="isSaving" @click="saveAdjustment" class="bg-amber-600 hover:bg-amber-700 text-white px-8">Save Record</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { SlidersHorizontal, LogIn, LogOut, Clock4, Search } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const isSaving = ref(false)
const search = ref('')
const filterStatus = ref('')
const filterDate = ref(new Date().toISOString().slice(0, 10))
const showAdjustModal = ref(false)
const adjustingRecord = ref<any>(null)

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'ON_TIME', label: 'On Time' },
  { value: 'LATE', label: 'Late' },
  { value: 'EARLY_LEAVE', label: 'Early' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'OVERTIME', label: 'Overtime' },
  { value: 'ON_LEAVE', label: 'On Leave' },
]

const adjustForm = ref({ checkIn: '', checkOut: '', status: '', reason: '' })
const attendance = ref<any[]>([])

const filteredAttendance = computed(() =>
  attendance.value.filter((r) => {
    const nameMatch = r.employeeName?.toLowerCase().includes(search.value.toLowerCase())
    const statusMatch = !filterStatus.value || r.status === filterStatus.value
    // Date filter is handled at API level usually, but we keep local filter if data is already fetched
    const dateMatch = !filterDate.value || r.date === filterDate.value
    return nameMatch && statusMatch && dateMatch
  }),
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const statusVariant = (status: string) => {
  if (status === 'ON_TIME') return 'success' as const
  if (status === 'LATE') return 'warning' as const
  if (status === 'ABSENT') return 'danger' as const
  if (status === 'EARLY_LEAVE' || status === 'EARLY') return 'warning' as const
  if (status === 'OVERTIME') return 'info' as const
  return 'default' as const
}

const openAdjust = (record: any) => {
  adjustingRecord.value = record
  adjustForm.value = { checkIn: record.checkIn ?? '', checkOut: record.checkOut ?? '', status: record.status, reason: '' }
  showAdjustModal.value = true
}

const saveAdjustment = async () => {
  isSaving.value = true
  try {
    await api.patch(`/attendance/${adjustingRecord.value.id}/adjust`, adjustForm.value)
    const idx = attendance.value.findIndex((r) => r.id === adjustingRecord.value.id)
    if (idx !== -1) attendance.value[idx] = { ...attendance.value[idx], ...adjustForm.value }
    showAdjustModal.value = false
  } catch {}
  isSaving.value = false
}

const fetchAttendance = async () => {
  isLoading.value = true
  try {
    const params = filterDate.value ? `?date=${filterDate.value}` : ''
    const res = await api.get<any>(`/attendance${params}`)
    attendance.value = (res as any)?.data ?? res ?? []
  } catch {}
  isLoading.value = false
}

watch(filterDate, fetchAttendance)
onMounted(fetchAttendance)
</script>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
</style>

<template>
  <div>
    <UiPageHeader
      title="Work Schedules"
      description="Manage Fixed, Flexi, and Shift-based workforce scheduling policies."
    >
      <template #actions>
        <UiButton @click="openCreate">
          <Plus class="w-4 h-4 mr-2" />
          New Schedule
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Toolbar -->
      <UiCard class="p-4 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search schedules by name..."
              class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Filter:</span>
            <UiSelect v-model="filterType" :options="typeOptions" class="h-10 text-sm" />
          </div>
        </div>
      </UiCard>

      <!-- Grid view for schedules instead of just table? Let's stick to table but make it very clean -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Schedule Name</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Type</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Time / Hours</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Grace Period</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Status</th>
                <th class="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Loading schedules...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredSchedules.length === 0">
                <td colspan="6" class="px-6 py-16 text-center">
                   <div class="flex flex-col items-center gap-2">
                    <Inbox class="w-8 h-8 text-slate-200 dark:text-slate-800" />
                    <span class="text-sm font-medium text-slate-400 dark:text-slate-600">No schedules match your criteria.</span>
                  </div>
                </td>
              </tr>
              <tr
                v-for="schedule in filteredSchedules"
                :key="schedule.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-900 dark:text-white">{{ schedule.name }}</span>
                    <span class="text-[11px] text-slate-400 mt-0.5" v-if="schedule.description">{{ schedule.description }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <UiBadge :variant="typeVariant(schedule.type)" class="font-bold tracking-tight px-2.5 py-0.5">{{ schedule.type }}</UiBadge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <Clock class="w-3.5 h-3.5 text-slate-400" />
                    <span v-if="schedule.type === 'Flexi Hours'">{{ schedule.minHours }}h min / day</span>
                    <span v-else>{{ schedule.startTime }} – {{ schedule.endTime }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                   <span class="bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 text-[11px] font-bold px-2 py-1 rounded-lg">
                     {{ schedule.gracePeriodMinutes || 0 }}m
                   </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" :class="schedule.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'" />
                    <span class="text-xs font-bold" :class="schedule.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
                      {{ schedule.isActive ? 'Active' : 'Draft' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center gap-0.5 justify-end">
                    <button class="p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.08] text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:shadow-sm transition-all" title="Edit" @click="openEdit(schedule)">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button class="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all" title="Delete" @click="confirmDelete(schedule)">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal v-model="showModal" :title="editingSchedule ? 'Edit Schedule' : 'New Work Schedule'" size="md">
      <form class="space-y-4" @submit.prevent="saveSchedule">
        <UiInput v-model="form.name" label="Schedule Name" placeholder="e.g. Regular Day, Night Shift" required />
        <UiSelect v-model="form.type" label="Schedule Type" :options="typeOptions.filter(o => o.value !== '')" required />

        <div v-if="form.type !== 'FLEXI'" class="grid grid-cols-2 gap-4">
          <UiInput v-model="form.startTime" label="Start Time" type="time" required />
          <UiInput v-model="form.endTime" label="End Time" type="time" required />
        </div>
        <div v-else>
          <UiInput v-model.number="form.minHours" label="Minimum Daily Work Hours" type="number" min="1" max="24" required />
        </div>

        <UiInput v-model.number="form.gracePeriodMinutes" label="Grace Period (minutes before mark as Late)" type="number" min="0" max="120" />

        <div class="flex items-center justify-end gap-3 pt-6">
          <UiButton type="button" variant="outline" @click="showModal = false">Cancel</UiButton>
          <UiButton type="submit" :loading="isSaving" class="px-6">{{ editingSchedule ? 'Update Schedule' : 'Create Schedule' }}</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Pencil, Trash2, Plus, Search, Clock, Inbox, UserMinus, UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'manager' })

const api = useApi()
const isLoading = ref(false)
const isSaving = ref(false)
const search = ref('')
const filterType = ref('')
const showModal = ref(false)
const editingSchedule = ref<any>(null)

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'FIXED', label: 'Fixed Schedule' },
  { value: 'FLEXI', label: 'Flexi Hours' },
  { value: 'SHIFT', label: 'Shift-based' },
]

const form = ref({
  name: '',
  type: 'FIXED',
  startTime: '09:00',
  endTime: '17:00',
  minHours: 8,
  gracePeriodMinutes: 10,
})

const schedules = ref<any[]>([])

const filteredSchedules = computed(() => {
  return schedules.value.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.value.toLowerCase())
    const matchType = !filterType.value || s.type === filterType.value
    return matchSearch && matchType
  })
})

const typeVariant = (type: string) => {
  if (type === 'FIXED') return 'info' as const
  if (type === 'Flexi Hours' || type === 'FLEXI') return 'success' as const
  if (type === 'SHIFT') return 'warning' as const
  return 'default' as const
}

const openCreate = () => {
  editingSchedule.value = null
  form.value = { name: '', type: 'FIXED', startTime: '09:00', endTime: '17:00', minHours: 8, gracePeriodMinutes: 10 }
  showModal.value = true
}

const openEdit = (s: any) => {
  editingSchedule.value = s
  form.value = { 
    name: s.name, 
    type: s.type, 
    startTime: s.startTime ?? '09:00', 
    endTime: s.endTime ?? '17:00', 
    minHours: s.minHours ?? 8, 
    gracePeriodMinutes: s.gracePeriodMinutes ?? 10 
  }
  showModal.value = true
}

const confirmDelete = async (s: any) => {
  if (!confirm(`Delete schedule "${s.name}"? This may affect assigned employees.`)) return
  try {
    await api.delete(`/schedules/${s.id}`)
    schedules.value = schedules.value.filter((x) => x.id !== s.id)
  } catch {}
}

const saveSchedule = async () => {
  isSaving.value = true
  try {
    if (editingSchedule.value) {
      const updated = await api.patch<any>(`/schedules/${editingSchedule.value.id}`, form.value)
      const idx = schedules.value.findIndex((s) => s.id === editingSchedule.value.id)
      if (idx !== -1) schedules.value[idx] = (updated as any)?.data ?? updated
    } else {
      const created = await api.post<any>('/schedules', form.value)
      schedules.value.unshift((created as any)?.data ?? created)
    }
    showModal.value = false
  } catch {}
  isSaving.value = false
}

const fetchSchedules = async () => {
  isLoading.value = true
  try {
    const res = await api.get<any>('/schedules')
    schedules.value = (res as any)?.data ?? res ?? []
  } catch {}
  isLoading.value = false
}

onMounted(fetchSchedules)
</script>

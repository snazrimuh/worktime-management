<template>
  <div>
    <UiPageHeader
      title="Schedule Assignments"
      description="Link employees to specific work schedules and define effective date ranges."
    >
      <template #actions>
        <UiButton @click="openAssign">
          <UserPlus2 class="w-4 h-4 mr-2" />
          Assign Schedule
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
              placeholder="Search employee or department..."
              class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Policy:</span>
            <UiSelect v-model="filterSchedule" :options="scheduleOptions" class="h-10 text-sm md:w-52" />
          </div>
        </div>
      </UiCard>

      <!-- Assignments Table -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Employee</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Assigned Schedule</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Active Period</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Status</th>
                <th class="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="5" class="px-6 py-16 text-center text-slate-400 dark:text-slate-500 font-medium italic">Loading assignment records...</td>
              </tr>
              <tr v-else-if="filteredAssignments.length === 0">
                <td colspan="5" class="px-6 py-16 text-center text-slate-400 dark:text-slate-500 font-medium italic">No active assignments found.</td>
              </tr>
              <tr
                v-for="a in filteredAssignments"
                :key="a.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :name="a.employeeName" size="sm" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white leading-tight">{{ a.employeeName }}</span>
                      <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ a.department }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-700 dark:text-slate-200">{{ a.scheduleName }}</span>
                    <span class="text-[10px]"><UiBadge :variant="typeVariant(a.scheduleType)" class="mt-1 transform scale-90 origin-left">{{ a.scheduleType }}</UiBadge></span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <CalendarDays class="w-3.5 h-3.5 text-slate-400" />
                    {{ formatDate(a.effectiveFrom) }} <span class="text-slate-300">→</span> {{ a.effectiveTo ? formatDate(a.effectiveTo) : 'Indefinite' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" :class="a.isActive ? 'bg-emerald-500' : 'bg-slate-300'" />
                    <span class="text-xs font-bold" :class="a.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                      {{ a.isActive ? 'Active' : 'Expired' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition-all" title="Terminate Assignment" @click="revokeAssignment(a)">
                    <Link2Off class="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- Assign Modal -->
    <UiModal v-model="showModal" title="New Schedule Assignment" size="md">
      <form class="space-y-6" @submit.prevent="saveAssignment">
        <div class="space-y-2">
           <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Employee Account</label>
           <UiInput v-model="form.employeeId" placeholder="e.g. employee-uuid-123" required />
           <p class="text-[10px] text-slate-400 leading-tight">Enter the unique identifier of the employee to link.</p>
        </div>

        <div class="space-y-2">
           <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Target Work Schedule</label>
           <UiSelect v-model="form.scheduleId" :options="scheduleOptions.filter(o => o.value !== '')" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UiInput v-model="form.effectiveFrom" label="Effective Start Date" type="date" required />
          <UiInput v-model="form.effectiveTo" label="Effective End Date (Optional)" type="date" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-white/[0.05]">
          <UiButton type="button" variant="outline" @click="showModal = false" class="px-6">Cancel</UiButton>
          <UiButton type="submit" :loading="isSaving" class="px-8 shadow-lg shadow-sky-500/20">Create Assignment</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, CalendarDays, UserPlus2, Link2Off } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const isSaving = ref(false)
const search = ref('')
const filterSchedule = ref('')
const showModal = ref(false)
const assignments = ref<any[]>([])
const scheduleOptions = ref([{ value: '', label: 'All Schedules' }])

const form = ref({ employeeId: '', scheduleId: '', effectiveFrom: '', effectiveTo: '' })

const filteredAssignments = computed(() =>
  assignments.value.filter((a) => {
    const nameMatch = a.employeeName?.toLowerCase().includes(search.value.toLowerCase())
    const schedMatch = !filterSchedule.value || a.scheduleId === filterSchedule.value
    return nameMatch && schedMatch
  }),
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const typeVariant = (type: string) => {
  if (type === 'FIXED') return 'info' as const
  if (type === 'FLEXI') return 'success' as const
  if (type === 'SHIFT') return 'warning' as const
  return 'default' as const
}

const openAssign = () => {
  form.value = { employeeId: '', scheduleId: '', effectiveFrom: (new Date().toISOString().split('T')[0] ?? ''), effectiveTo: '' }
  showModal.value = true
}

const saveAssignment = async () => {
  isSaving.value = true
  try {
    const res = await api.post<any>('/schedule-assignments', form.value)
    assignments.value.unshift((res as any)?.data ?? res)
    showModal.value = false
  } catch {}
  isSaving.value = false
}

const revokeAssignment = async (a: any) => {
  if (!confirm(`Are you sure you want to terminate "${a.scheduleName}" assignment for ${a.employeeName}?`)) return
  try {
    await api.delete(`/schedule-assignments/${a.id}`)
    assignments.value = assignments.value.filter((x) => x.id !== a.id)
  } catch {}
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [aRes, sRes] = await Promise.all([
      api.get<any>('/schedule-assignments'),
      api.get<any>('/schedules'),
    ])
    assignments.value = (aRes as any)?.data ?? aRes ?? []
    const schedules: any[] = (sRes as any)?.data ?? sRes ?? []
    scheduleOptions.value = [{ value: '', label: 'All Schedules' }, ...schedules.map(s => ({ value: s.id, label: s.name }))]
  } catch {}
  isLoading.value = false
})
</script>

<template>
  <div>
    <UiPageHeader
      title="My Requests"
      description="Track your schedule change and shift swap requests or submit a new one."
    >
      <template #actions>
        <UiButton @click="openCreate">
          <Send class="w-4 h-4 mr-2" />
          New Request
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Active Schedule Snippet -->
      <UiCard class="p-6 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent overflow-hidden relative">
        <div class="absolute top-0 right-0 p-6 opacity-10 dark:opacity-5">
           <CalendarDays class="w-24 h-24" />
        </div>
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Currently Assigned Policy</span>
            <div v-if="mySchedule" class="flex items-baseline gap-3">
              <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ mySchedule.name }}</h2>
              <UiBadge variant="success" class="text-[9px] font-black uppercase px-2 py-0 border-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Live</UiBadge>
            </div>
            <p v-if="mySchedule" class="text-sm text-slate-500 font-medium">
              {{ mySchedule.type }} · {{ mySchedule.startTime ?? '00:00' }} – {{ mySchedule.endTime ?? '23:59' }}
            </p>
            <p v-else class="text-sm text-slate-400">No active work schedule assigned yet.</p>
          </div>
          <div class="flex items-center gap-2">
             <div class="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block mx-4" />
             <div class="text-right flex flex-col items-end">
               <span class="text-[10px] font-bold text-slate-400 uppercase">Effective Since</span>
               <span class="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">{{ mySchedule?.effectiveFrom ? formatDate(mySchedule.effectiveFrom) : 'N/A' }}</span>
             </div>
          </div>
        </div>
      </UiCard>

      <!-- Subscribed Requests -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="px-6 py-4 flex items-center justify-between border-b border-slate-50 dark:border-white/[0.05]">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Submission History</h3>
          <span class="text-[10px] font-bold text-slate-400">{{ requests.length }} Request(s)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/30 dark:bg-white/[0.01]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Type</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Details & Reason</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Submitted</th>
                <th class="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Current Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="4" class="px-6 py-16 text-center text-slate-400 dark:text-slate-600 font-bold italic animate-pulse">Syncing your requests...</td>
              </tr>
              <tr v-else-if="requests.length === 0">
                <td colspan="4" class="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                  <div class="flex flex-col items-center gap-2">
                    <History class="w-8 h-8 text-slate-100 dark:text-slate-900" />
                    <p class="text-xs font-semibold">Empty history. All work is going as scheduled.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="req in requests"
                :key="req.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <UiBadge :variant="req.type === 'SWAP' ? 'info' : 'warning'" class="font-black text-[10px] px-2.5 py-0.5">{{ req.type === 'SWAP' ? 'Shift Swap' : 'Scheduling' }}</UiBadge>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 italic">{{ req.details }}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{{ req.reason }}</p>
                </td>
                <td class="px-6 py-4 text-center font-mono text-[11px] text-slate-500">{{ formatDate(req.createdAt) }}</td>
                <td class="px-6 py-4 text-right">
                  <UiBadge :variant="statusVariant(req.status)" class="font-black px-2 py-0.5 text-[10px] uppercase tracking-tighter">{{ req.status }}</UiBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- New Request Modal -->
    <UiModal v-model="showModal" title="Formal Schedule Request" size="md">
      <form class="space-y-6" @submit.prevent="submitRequest">
        <div class="space-y-4">
             <div class="space-y-2">
               <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Type of Adjustment</label>
               <UiSelect v-model="form.type" :options="typeOptions" required />
            </div>

            <div class="space-y-2">
               <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Affected Effective Date</label>
               <UiInput v-model="form.targetDate" type="date" required />
            </div>

            <div class="space-y-2">
               <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Explanation & Rationale</label>
               <UiTextarea v-model="form.reason" placeholder="Clearly describe why this adjustment is needed..." rows="4" required />
            </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-white/[0.05]">
          <UiButton type="button" variant="outline" @click="showModal = false" class="px-6">Close</UiButton>
          <UiButton type="submit" :loading="isSaving" class="px-10 shadow-lg shadow-sky-500/20">Submit Formal Request</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Send, History, CalendarDays } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const isSaving = ref(false)
const showModal = ref(false)
const requests = ref<any[]>([])
const mySchedule = ref<any>(null)

const typeOptions = [
  { value: 'CHANGE', label: 'Permanent Schedule Change' },
  { value: 'SWAP', label: 'One-time Shift Swap' },
]

const form = ref({ type: 'CHANGE', targetDate: '', reason: '' })

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const statusVariant = (s: string) => {
  if (s === 'APPROVED') return 'success' as const
  if (s === 'REJECTED') return 'danger' as const
  return 'warning' as const
}

const openCreate = () => {
  form.value = { type: 'CHANGE', targetDate: (new Date().toISOString().split('T')[0] ?? ''), reason: '' }
  showModal.value = true
}

const submitRequest = async () => {
  isSaving.value = true
  try {
    const res = await api.post<any>('/requests', form.value)
    requests.value.unshift((res as any)?.data ?? res)
    showModal.value = false
  } catch {}
  isSaving.value = false
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const [reqRes, schRes] = await Promise.all([
      api.get<any>('/requests/my'),
      api.get<any>('/schedules/my/active'),
    ])
    requests.value = (reqRes as any)?.data ?? reqRes ?? []
    mySchedule.value = (schRes as any)?.data ?? schRes
  } catch {}
  isLoading.value = false
}

onMounted(fetchData)
</script>

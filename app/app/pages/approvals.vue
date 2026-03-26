<template>
  <div>
    <UiPageHeader
      title="Request Approvals"
      description="Review and process employee requests for schedule changes and shift swaps."
    >
      <template #actions>
        <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Filter:</span>
            <div class="flex items-center glass-subtle rounded-xl p-1 shadow-sm ring-1 ring-black/5">
                <button 
                  v-for="opt in statusPills" 
                  :key="opt.value"
                  class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  :class="filterStatus === opt.value 
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
                  @click="filterStatus = opt.value"
                >
                  {{ opt.label }}
                </button>
            </div>
        </div>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Toolbar -->
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
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Type:</span>
            <UiSelect v-model="filterType" :options="typeOptions" class="h-10 text-sm md:w-48" />
          </div>
        </div>
      </UiCard>

      <!-- Requests List -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Requester</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">Request Type</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Details & Rationale</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Submitted On</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Current Status</th>
                <th class="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Decision</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-20 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                    <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching pool...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredRequests.length === 0">
                <td colspan="6" class="px-6 py-24 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center">
                       <CheckCircle2 class="w-8 h-8 text-emerald-500/30" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm font-bold text-slate-900 dark:text-white">All Clear.</p>
                      <p class="text-xs text-slate-400">No pending approvals matching your filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr
                v-for="req in filteredRequests"
                :key="req.id"
                class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :name="req.requesterName" size="sm" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white leading-tight">{{ req.requesterName }}</span>
                      <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ req.department }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <UiBadge :variant="typeVariant(req.type)" class="font-bold text-[10px] px-2.5 py-1">{{ req.type === 'SWAP' ? 'Shift Swap' : 'Scheduling' }}</UiBadge>
                </td>
                <td class="px-6 py-4 max-w-xs">
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1 italic">{{ req.details }}</p>
                    <p v-if="req.reason" class="text-[11px] text-slate-400 font-medium leading-tight line-clamp-2">Rationale: {{ req.reason }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ formatDate(req.createdAt) }}</span>
                </td>
                <td class="px-6 py-4">
                  <UiBadge :variant="statusVariant(req.status)" class="font-black px-2 py-0.5 text-[10px] uppercase tracking-tighter">{{ req.status }}</UiBadge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div v-if="req.status === 'PENDING'" class="flex items-center justify-end gap-2">
                    <button
                      class="h-8 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      @click="handleAction(req, 'APPROVED')"
                    >Approve</button>
                    <button
                      class="h-8 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/20 transition-all"
                      @click="handleAction(req, 'REJECTED')"
                    >Reject</button>
                  </div>
                  <span v-else class="text-[10px] font-bold text-slate-300 dark:text-white/10 uppercase italic">Decision Logged</span>
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
import { Search, CheckCircle2 } from 'lucide-vue-next'

definePageMeta({ middleware: 'manager' })

const api = useApi()
const isLoading = ref(false)
const search = ref('')
const filterType = ref('')
const filterStatus = ref('PENDING')

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'CHANGE', label: 'Schedule Change' },
  { value: 'SWAP', label: 'Shift Swap' },
]

const statusPills = [
  { value: 'PENDING', label: 'Pending Inbox' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

const requests = ref<any[]>([])

const filteredRequests = computed(() =>
  requests.value.filter((r) => {
    const nameMatch = r.requesterName?.toLowerCase().includes(search.value.toLowerCase())
    const typeMatch = !filterType.value || r.type === filterType.value
    const statusMatch = !filterStatus.value || r.status === filterStatus.value
    return nameMatch && typeMatch && statusMatch
  }),
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const typeVariant = (type: string) => type === 'SWAP' ? 'info' as const : 'warning' as const
const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success' as const
  if (status === 'REJECTED') return 'danger' as const
  return 'warning' as const
}

const handleAction = async (req: any, action: 'APPROVED' | 'REJECTED') => {
  try {
    await api.patch(`/schedule-requests/${req.id}/approve`, { status: action })
    const idx = requests.value.findIndex((r) => r.id === req.id)
    if (idx !== -1) requests.value[idx].status = action
  } catch {}
}

const fetchRequests = async () => {
  isLoading.value = true
  try {
    const res = await api.get<any>('/schedule-requests')
    requests.value = (res as any)?.data ?? res ?? []
  } catch {}
  isLoading.value = false
}

onMounted(fetchRequests)
</script>

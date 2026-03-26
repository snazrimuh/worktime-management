<template>
  <div>
    <UiPageHeader
      title="My Work Schedule"
      description="Review your active work policy, core hours, and upcoming schedule adjustments."
    />

    <div class="space-y-6">
      <!-- Current Assignment -->
      <UiCard class="p-8 border-none shadow-xl ring-1 ring-black/5 dark:ring-white/5 bg-gradient-to-br from-white/60 to-white/20 dark:from-white/5 dark:to-transparent relative overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5">
           <Briefcase class="w-32 h-32" />
        </div>
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-8">
            <div class="space-y-1.5">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Active Employment Policy</span>
              <div v-if="mySchedule" class="flex items-baseline gap-4">
                <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ mySchedule.name }}</h2>
                <UiBadge variant="success" class="text-[10px] font-black uppercase px-3 py-0.5 border-none shadow-sm shadow-emerald-500/20">LIVE STATUS</UiBadge>
              </div>
              <p v-else class="text-lg font-bold text-slate-400 italic">No Active Assignment</p>
            </div>
          </div>

          <div v-if="mySchedule" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="rounded-2xl glass-subtle p-5 border-none shadow-sm ring-1 ring-black/5">
              <div class="flex items-center gap-2 mb-2 text-slate-400">
                <Clock class="w-4 h-4" />
                <span class="text-[10px] font-bold uppercase tracking-wider">Operational Hours</span>
              </div>
              <p class="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">
                {{ mySchedule.type === 'FLEXI' ? `${mySchedule.minHours}h / day` : `${mySchedule.startTime} – ${mySchedule.endTime}` }}
              </p>
              <p class="text-[10px] font-medium text-slate-400 mt-1 uppercase">{{ mySchedule.type }} MODE</p>
            </div>
            
            <div class="rounded-2xl glass-subtle p-5 border-none shadow-sm ring-1 ring-black/5">
              <div class="flex items-center gap-2 mb-2 text-slate-400">
                <Timer class="w-4 h-4" />
                <span class="text-[10px] font-bold uppercase tracking-wider">Grace Window</span>
              </div>
              <p class="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{{ mySchedule.gracePeriodMinutes }} MINUTES</p>
              <p class="text-[10px] font-medium text-slate-400 mt-1 uppercase">UNTIL MARKED LATE</p>
            </div>

            <div class="rounded-2xl glass-subtle p-5 border-none shadow-sm ring-1 ring-black/5">
              <div class="flex items-center gap-2 mb-2 text-slate-400">
                <CalendarCheck class="w-4 h-4" />
                <span class="text-[10px] font-bold uppercase tracking-wider">Policy Effective</span>
              </div>
              <p class="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{{ formatDate(mySchedule.effectiveFrom) }}</p>
              <p class="text-[10px] font-medium text-slate-400 mt-1 uppercase">SINCE ASSIGNMENT</p>
            </div>
          </div>
          <div v-else class="py-10 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
             <p class="text-slate-400 font-medium italic">You are currently not assigned to any work schedule policy.</p>
          </div>
        </div>
      </UiCard>

      <!-- Upcoming Transitions -->
      <UiCard class="p-6 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="flex items-center gap-3 mb-6">
           <div class="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600">
              <ArrowRightLeft class="w-5 h-5 transition-transform group-hover:rotate-12" />
           </div>
           <h2 class="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Policy Transitions</h2>
        </div>
        
        <div v-if="upcomingChanges.length === 0" class="py-12 text-center bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-slate-50 dark:border-white/[0.04]">
          <p class="text-sm text-slate-400 font-medium italic">No future schedule changes are staged for your account.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="change in upcomingChanges"
            :key="change.id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 hover:border-sky-200 dark:hover:border-sky-500/20 transition-all group"
          >
            <div class="flex items-center gap-4">
               <div class="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                  <CalendarDays class="w-5 h-5" />
               </div>
               <div>
                <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ change.scheduleName }}</p>
                <p class="text-[11px] text-slate-400 font-bold uppercase mt-1">Effective: {{ formatDate(change.effectiveFrom) }}</p>
              </div>
            </div>
            <UiBadge variant="info" class="text-[9px] font-black uppercase tracking-tighter">FUTURE ACTION</UiBadge>
          </div>
        </div>
      </UiCard>

      <!-- Help Info -->
      <div class="rounded-2xl bg-sky-50/50 dark:bg-sky-500/[0.03] p-6 border border-sky-100/50 dark:border-sky-500/10">
        <div class="flex gap-4">
           <div class="shrink-0 text-sky-500 mt-1">
              <Info class="w-5 h-5" />
           </div>
           <div class="space-y-1">
             <h4 class="text-sm font-bold text-slate-900 dark:text-white">Need to request a change?</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
               If your work availability has changed or you need a Different shift, please submit a formal request through the <strong>My Requests</strong> portal. All changes require manager approval before they become effective.
             </p>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, Timer, CalendarCheck, Briefcase, CalendarDays, ArrowRightLeft, Info } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const mySchedule = ref<any>(null)
const upcomingChanges = ref<any[]>([])

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  try {
    const [schRes, upcomingRes] = await Promise.all([
      api.get<any>('/schedules/my/active'),
      api.get<any>('/schedules/my/upcoming'),
    ])
    mySchedule.value = (schRes as any)?.data ?? schRes
    upcomingChanges.value = (upcomingRes as any)?.data ?? upcomingRes ?? []
  } catch {}
})
</script>

<template>
  <div>
    <UiPageHeader
      title="Rules & Configuration"
      description="Define global workspace rules, leave policies, and attendance thresholds."
    >
      <template #actions>
        <UiButton :loading="isSaving" @click="saveConfig" class="px-8 shadow-lg shadow-sky-500/20">
          <Save class="w-4 h-4 mr-2" />
          Save Changes
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Work Hours Config -->
        <UiCard class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600">
               <Timer2 class="w-5 h-5" />
            </div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Work Hours & Tolerance</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <UiInput v-model.number="config.standardHoursPerDay" label="Standard Hours / Day" type="number" min="1" max="24" />
            <UiInput v-model.number="config.gracePeriodMinutes" label="Global Grace Period (m)" type="number" min="0" max="60" />
            <UiInput v-model.number="config.maxConsecutiveWorkDays" label="Max Consecutive Days" type="number" min="1" max="30" />
            <UiInput v-model.number="config.minRestHoursBetweenShifts" label="Min Rest Hours (Shifts)" type="number" min="0" max="24" />
          </div>
        </UiCard>

        <!-- Overtime Config -->
        <UiCard class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600">
               <Zap class="w-5 h-5" />
            </div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Overtime & Detection</h2>
          </div>
          <div class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <UiInput v-model.number="config.overtimeThresholdMinutes" label="Overtime Threshold (min)" type="number" min="0" />
              <UiSelect v-model="config.overtimeCountMethod" label="Calculation Logic" :options="[{ value: 'PER_HOUR', label: 'Per Hour' }, { value: 'PER_TASK', label: 'Per Task' }]" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <UiInput v-model.number="config.noShowDetectionHours" label="Absent Marker (hours)" type="number" min="1" max="24" />
              <UiSelect v-model="config.noShowDetectionMode" label="Detection Mode" :options="[{ value: 'AFTER_HOURS', label: 'N Hours After Start' }, { value: 'END_OF_DAY', label: 'End of Work Day' }]" />
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Holidays -->
      <UiCard class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600">
               <CalendarHeart class="w-5 h-5" />
            </div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Public Holidays</h2>
          </div>
          <UiButton size="sm" variant="outline" @click="addHoliday">
            <Plus class="w-4 h-4 mr-1.5" />
            Add Holiday
          </UiButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="(holiday, idx) in config.holidays"
            :key="idx"
            class="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02] px-3 py-2.5 group transition-all hover:border-rose-200 dark:hover:border-rose-500/20"
          >
            <input v-model="holiday.date" type="date" class="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none w-[110px]" />
            <input v-model="holiday.name" type="text" placeholder="Holiday name" class="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none flex-1 border-none placeholder:text-slate-400 placeholder:font-normal" />
            <button class="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1" @click="removeHoliday(idx)">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div v-if="config.holidays.length === 0" class="col-span-full py-10 text-center border-2 border-dashed border-slate-100 dark:border-white/[0.04] rounded-2xl">
             <p class="text-sm text-slate-400 font-medium italic">No public holidays defined for this year.</p>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, Timer as Timer2, Zap, CalendarHeart, Plus, X } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })

const api = useApi()
const isSaving = ref(false)

const config = ref({
  standardHoursPerDay: 8,
  gracePeriodMinutes: 10,
  maxConsecutiveWorkDays: 6,
  minRestHoursBetweenShifts: 11,
  overtimeThresholdMinutes: 30,
  overtimeCountMethod: 'PER_HOUR',
  noShowDetectionHours: 4,
  noShowDetectionMode: 'AFTER_HOURS',
  holidays: [] as Array<{ date: string; name: string }>,
})

const addHoliday = () => {
  config.value.holidays.push({ date: (new Date().toISOString().split('T')[0] ?? ''), name: '' })
}

const removeHoliday = (idx: number) => {
  config.value.holidays.splice(idx, 1)
}

const saveConfig = async () => {
  isSaving.value = true
  try {
    await api.put('/config/rules', config.value)
  } catch {}
  isSaving.value = false
}

const fetchConfig = async () => {
  try {
    const res = await api.get<any>('/config/rules')
    const data = (res as any)?.data ?? res
    if (data) Object.assign(config.value, data)
  } catch {}
}

onMounted(fetchConfig)
</script>

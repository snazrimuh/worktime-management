<template>
  <div class="max-w-lg mx-auto space-y-6">
    <!-- Current Schedule Card -->
    <UiCard class="p-6 text-center">
      <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Today's Schedule</p>
      <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ todaySchedule?.name ?? 'No schedule assigned' }}</p>
      <p v-if="todaySchedule" class="text-base text-slate-500 dark:text-slate-400 mt-1">
        {{ todaySchedule.startTime }} – {{ todaySchedule.endTime }}
      </p>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ currentTime }}</p>
    </UiCard>

    <!-- Check In / Out Panel -->
    <UiCard class="p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl border border-white/50 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.04] p-4 text-center">
          <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Check In</p>
          <p class="text-2xl font-bold font-mono" :class="attendance?.checkIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'">
            {{ attendance?.checkIn ?? '--:--' }}
          </p>
          <p v-if="attendance?.checkInStatus" class="text-xs mt-1">
            <UiBadge :variant="statusVariant(attendance.checkInStatus)">{{ attendance.checkInStatus }}</UiBadge>
          </p>
        </div>

        <div class="rounded-xl border border-white/50 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.04] p-4 text-center">
          <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Check Out</p>
          <p class="text-2xl font-bold font-mono" :class="attendance?.checkOut ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'">
            {{ attendance?.checkOut ?? '--:--' }}
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <UiButton
          v-if="!attendance?.checkIn"
          class="w-full"
          size="lg"
          :loading="isLoading"
          :disabled="!todaySchedule"
          @click="doCheckIn"
        >
          ⏱ Check In Now
        </UiButton>
        <UiButton
          v-else-if="!attendance?.checkOut"
          class="w-full"
          size="lg"
          variant="outline"
          :loading="isLoading"
          @click="doCheckOut"
        >
          🏁 Check Out Now
        </UiButton>
        <div v-else class="text-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold py-3">
          ✅ You've completed your attendance for today.
        </div>
      </div>

      <p v-if="errorMessage" class="text-sm text-rose-500 dark:text-rose-400 text-center">{{ errorMessage }}</p>
    </UiCard>

    <!-- Duration Tracker -->
    <UiCard v-if="attendance?.checkIn" class="p-4 text-center">
      <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Work Duration</p>
      <p class="text-3xl font-bold font-mono text-slate-900 dark:text-white">{{ workDuration }}</p>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()
const isLoading = ref(false)
const errorMessage = ref('')
const attendance = ref<any>(null)
const todaySchedule = ref<any>(null)
const currentTime = ref('')
const workDuration = ref('00:00:00')

let clockInterval: ReturnType<typeof setInterval>

const statusVariant = (s: string) => {
  if (s === 'ON_TIME') return 'success' as const
  if (s === 'LATE') return 'warning' as const
  return 'default' as const
}

const updateClock = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  if (attendance.value?.checkIn && !attendance.value?.checkOut) {
    const start = new Date(`1970-01-01T${attendance.value.checkIn}`)
    const now = new Date()
    const nowTime = new Date(`1970-01-01T${now.toTimeString().slice(0, 8)}`)
    const diff = Math.max(0, nowTime.getTime() - start.getTime())
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    workDuration.value = `${h}:${m}:${s}`
  }
}

const doCheckIn = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await api.post<any>('/attendance/checkin', {})
    attendance.value = (res as any)?.data ?? res
  } catch (e: any) {
    errorMessage.value = e?.data?.message || 'Check-in failed.'
  }
  isLoading.value = false
}

const doCheckOut = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await api.post<any>('/attendance/checkout', {})
    attendance.value = (res as any)?.data ?? res
  } catch (e: any) {
    errorMessage.value = e?.data?.message || 'Check-out failed.'
  }
  isLoading.value = false
}

const fetchTodayData = async () => {
  try {
    const [attRes, schRes] = await Promise.all([
      api.get<any>('/attendance/today'),
      api.get<any>('/schedules/my/today'),
    ])
    attendance.value = (attRes as any)?.data ?? attRes
    todaySchedule.value = (schRes as any)?.data ?? schRes
  } catch {}
}

onMounted(async () => {
  await fetchTodayData()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

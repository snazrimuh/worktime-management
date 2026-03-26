<template>
  <div class="app-bg min-h-screen text-slate-900 dark:text-slate-200 flex">
    <div class="hidden md:block">
      <LayoutTheSidebar />
    </div>

    <Transition name="slide">
      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 z-40 md:hidden"
      >
        <div class="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" @click="showMobileSidebar = false" />
        <div class="relative z-50">
          <LayoutTheSidebar />
        </div>
      </div>
    </Transition>

    <div
      :class="[
        'flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        sidebarExpanded ? 'md:ml-64' : 'md:ml-20',
      ]"
    >
      <LayoutTheNavbar
        :page-title="pageTitle"
        :page-description="pageDescription"
        @toggle-sidebar="showMobileSidebar = !showMobileSidebar"
      />
      <main class="flex-1 p-4 md:p-6">
        <div class="max-w-6xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const showMobileSidebar = ref(false)
const sidebarExpanded = useState<boolean>('sidebar-expanded', () => false)

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Dashboard'
  if (path.startsWith('/schedules')) return 'Work Schedule Management'
  if (path.startsWith('/my-schedule')) return 'My Schedule'
  if (path.startsWith('/schedule-assignments')) return 'Schedule Assignments'
  if (path.startsWith('/calendar')) return 'Calendar View'
  if (path.startsWith('/attendance/checkin')) return 'Check In / Check Out'
  if (path.startsWith('/attendance')) return 'Attendance Log'
  if (path.startsWith('/my-attendance')) return 'My Attendance'
  if (path.startsWith('/requests/shift-swap')) return 'Shift Swap Request'
  if (path.startsWith('/requests')) return 'My Schedule Requests'
  if (path.startsWith('/approvals')) return 'Approvals'
  if (path.startsWith('/reports/adherence')) return 'Schedule Adherence'
  if (path.startsWith('/reports/attendance')) return 'Attendance Report'
  if (path.startsWith('/users')) return 'User Management'
  if (path.startsWith('/config')) return 'Rules & Configuration'
  if (path.includes('/settings')) return 'Settings'
  return 'Worktime'
})

const pageDescription = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Overview of workforce schedules, attendance summary, and key performance metrics.'
  if (path.startsWith('/schedules')) return 'Create and manage Fixed, Flexi, and Shift-based work schedules.'
  if (path.startsWith('/my-schedule')) return 'View your assigned work schedule and upcoming shifts.'
  if (path.startsWith('/schedule-assignments')) return 'Assign schedules to individuals, teams, or divisions.'
  if (path.startsWith('/calendar')) return 'Visual monthly and weekly view of all employee schedules.'
  if (path.startsWith('/attendance/checkin')) return 'Record your check-in and check-out for today.'
  if (path.startsWith('/attendance')) return 'Full attendance records with planned vs. actual comparison.'
  if (path.startsWith('/my-attendance')) return 'View your personal attendance history and status.'
  if (path.startsWith('/requests/shift-swap')) return 'Initiate a shift swap request with another employee.'
  if (path.startsWith('/requests')) return 'Manage your schedule change requests and their approval status.'
  if (path.startsWith('/approvals')) return 'Review and approve or reject employee schedule change and swap requests.'
  if (path.startsWith('/reports/adherence')) return 'Compare planned schedules against actual attendance to measure adherence.'
  if (path.startsWith('/reports/attendance')) return 'Daily and monthly attendance reports per employee or team.'
  if (path.startsWith('/users')) return 'Manage user accounts and assign roles within the system.'
  if (path.startsWith('/config')) return 'Configure grace periods, overtime rules, global scheduling constraints, and holidays.'
  return 'Workforce Execution & Scheduling System.'
})

watch(() => route.path, () => {
  showMobileSidebar.value = false
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>

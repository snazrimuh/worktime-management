<script setup lang="ts">
import { Bell, CheckCheck, Inbox, Clock } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const notifStore = useNotificationStore()

const notifications = computed(() => notifStore.notifications)

const formatDate = (d: string) => {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const variantFor = (type: string) => {
  if (type === 'SCHEDULE') return 'info' as const
  if (type === 'ATTENDANCE') return 'success' as const
  if (type === 'REQUEST') return 'warning' as const
  return 'default' as const
}

onMounted(() => {
  notifStore.fetch()
})
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="System Notifications"
      description="Stay updated with schedule changes, attendance alerts, and request approvals."
    >
      <template #actions>
        <UiButton v-if="notifStore.unreadCount > 0" size="sm" variant="outline" @click="notifStore.markAllAsRead">
          <CheckCheck class="w-4 h-4 mr-2" />
          Mark All Read
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="space-y-3">
      <UiCard v-if="notifications.length === 0" class="p-12 text-center opacity-50">
          <div class="flex flex-col items-center gap-3">
             <div class="p-4 rounded-full bg-slate-50 dark:bg-white/[0.03]">
                <Inbox class="w-8 h-8 text-slate-300" />
             </div>
             <p class="text-sm font-medium text-slate-500">Your notification inbox is clear.</p>
          </div>
      </UiCard>
      
      <UiCard
        v-for="n in notifications"
        :key="n.id"
        class="p-4 transition-all hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
        :class="!n.isRead ? 'ring-1 ring-sky-500/20 bg-sky-50/10 dark:bg-sky-500/[0.02]' : ''"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4">
             <div class="mt-1 h-10 w-10 flex items-center justify-center rounded-xl" :class="!n.isRead ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400'">
                <Bell class="w-5 h-5" />
             </div>
             <div>
                <div class="flex items-center gap-2 mb-1">
                   <UiBadge :variant="variantFor(n.type)" class="font-bold text-[10px]">{{ n.type }}</UiBadge>
                   <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock class="w-2.5 h-2.5" />
                      {{ formatDate(n.createdAt) }}
                   </span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-snug">{{ n.title }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ n.message }}</p>
             </div>
          </div>
          <button
            v-if="!n.isRead"
            class="p-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all font-bold text-[11px] uppercase tracking-wider"
            @click="notifStore.markAsRead(n.id)"
          >
            Mark Read
          </button>
        </div>
      </UiCard>
    </div>
  </div>
</template>

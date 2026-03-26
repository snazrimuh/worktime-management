import { defineStore } from 'pinia'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export const useNotificationStore = defineStore('notification', () => {
  const api = useApi()
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  async function fetch() {
    try {
      const res = await api.get<any>('/notifications')
      notifications.value = (res as any)?.data ?? res ?? []
    } catch {}
  }

  async function markAsRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`, {})
      const n = notifications.value.find(x => x.id === id)
      if (n) n.isRead = true
    } catch {}
  }

  async function markAllAsRead() {
    try {
      await api.patch('/notifications/read-all', {})
      notifications.value.forEach(n => n.isRead = true)
    } catch {}
  }

  return {
    notifications,
    unreadCount,
    fetch,
    markAsRead,
    markAllAsRead
  }
})

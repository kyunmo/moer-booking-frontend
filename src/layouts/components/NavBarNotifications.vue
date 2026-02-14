<script setup>
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, computed } from 'vue'

const notificationStore = useNotificationStore()
const router = useRouter()

// Map notification type to icon and color
function getNotificationIcon(type) {
  const map = {
    RESERVATION_NEW: { icon: 'ri-calendar-line', color: 'primary' },
    RESERVATION_CONFIRMED: { icon: 'ri-calendar-check-line', color: 'success' },
    RESERVATION_CANCELLED: { icon: 'ri-calendar-close-line', color: 'error' },
    RESERVATION_COMPLETED: { icon: 'ri-checkbox-circle-line', color: 'info' },
    RESERVATION_NO_SHOW: { icon: 'ri-user-unfollow-line', color: 'warning' },
    SYSTEM: { icon: 'ri-notification-2-line', color: 'secondary' },
  }
  return map[type] || map.SYSTEM
}

// Relative time formatter
function getRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr.replace(' ', 'T'))
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return dateStr.substring(0, 10)
}

// Transform API notifications to @core/Notifications.vue format
const mappedNotifications = computed(() => {
  return notificationStore.notifications.map(n => {
    const { icon, color } = getNotificationIcon(n.type)
    return {
      id: n.id,
      icon,
      color,
      title: n.title,
      subtitle: n.message,
      time: getRelativeTime(n.createdAt),
      isSeen: n.read,
      link: n.link,
    }
  })
})

const handleNotificationClick = (notification) => {
  if (!notification.isSeen) {
    notificationStore.markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
  }
}

const handleMarkRead = (ids) => {
  if (ids.length === notificationStore.notifications.length) {
    notificationStore.markAllAsRead()
  } else {
    ids.forEach(id => notificationStore.markAsRead(id))
  }
}

const handleMarkUnread = () => {
  // Not supported by API, no-op
}

const handleRemove = () => {
  // Not supported by API, no-op
}

onMounted(() => {
  notificationStore.startPolling()
})

onUnmounted(() => {
  notificationStore.stopPolling()
})
</script>

<template>
  <Notifications
    :notifications="mappedNotifications"
    @read="handleMarkRead"
    @unread="handleMarkUnread"
    @remove="handleRemove"
    @click:notification="handleNotificationClick"
  />
</template>

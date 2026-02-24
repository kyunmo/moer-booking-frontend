import { ref, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export function useSseNotifications() {
  const connected = ref(false)
  const connecting = ref(false)
  let eventSource = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 10
  const BASE_RECONNECT_DELAY = 3000

  function connect() {
    const token = localStorage.getItem('accessToken')
    if (!token || eventSource) return

    connecting.value = true
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

    // Use fetch + ReadableStream for SSE with auth header (EventSource doesn't support custom headers)
    const abortController = new AbortController()

    fetch(`${baseUrl}/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: abortController.signal,
    }).then(response => {
      if (!response.ok) throw new Error(`SSE connection failed: ${response.status}`)

      connecting.value = false
      connected.value = true
      reconnectAttempts = 0

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      function processStream() {
        reader.read().then(({ done, value }) => {
          if (done) {
            connected.value = false
            scheduleReconnect()
            return
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          let currentEvent = ''
          let currentData = ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim()
            }
            else if (line.startsWith('data:')) {
              currentData = line.slice(5).trim()
            }
            else if (line === '' && currentEvent) {
              handleEvent(currentEvent, currentData)
              currentEvent = ''
              currentData = ''
            }
          }

          processStream()
        }).catch(err => {
          if (err.name !== 'AbortError') {
            connected.value = false
            scheduleReconnect()
          }
        })
      }

      processStream()
    }).catch(err => {
      connecting.value = false
      connected.value = false
      if (err.name !== 'AbortError') {
        scheduleReconnect()
      }
    })

    // Store abort controller for cleanup
    eventSource = abortController
  }

  function handleEvent(eventType, dataStr) {
    const store = useNotificationStore()

    if (eventType === 'CONNECTED') {
      console.log('[SSE] Connected')
      return
    }

    try {
      const data = JSON.parse(dataStr)

      // Add to notifications list
      const notification = {
        id: data.id,
        type: eventType,
        title: getEventTitle(eventType),
        message: data.message,
        read: false,
        createdAt: new Date().toISOString(),
        link: getEventLink(eventType, data),
      }

      store.addRealtimeNotification(notification)
    }
    catch {
      // ignore parse errors
    }
  }

  function getEventTitle(eventType) {
    const titles = {
      NEW_RESERVATION: '새 예약',
      RESERVATION_CANCELLED: '예약 취소',
      PAYMENT_COMPLETED: '결제 완료',
      NEW_REVIEW: '새 리뷰',
    }
    return titles[eventType] || '알림'
  }

  function getEventLink(eventType, _data) {
    if (eventType === 'NEW_RESERVATION' || eventType === 'RESERVATION_CANCELLED') {
      return '/shop-admin/reservations'
    }
    if (eventType === 'PAYMENT_COMPLETED') {
      return '/shop-admin/payment/history'
    }
    if (eventType === 'NEW_REVIEW') {
      return '/shop-admin/reviews'
    }
    return null
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return

    const delay = BASE_RECONNECT_DELAY * Math.pow(2, Math.min(reconnectAttempts, 5))
    reconnectAttempts++

    reconnectTimer = setTimeout(() => {
      connect()
    }, delay)
  }

  function disconnect() {
    if (eventSource) {
      eventSource.abort()
      eventSource = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    connected.value = false
    connecting.value = false
    reconnectAttempts = 0
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    connecting,
    connect,
    disconnect,
  }
}

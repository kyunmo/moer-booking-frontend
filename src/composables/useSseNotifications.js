import { ref, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export function useSseNotifications() {
  const connected = ref(false)
  const connecting = ref(false)
  const lastHeartbeat = ref(null)
  let eventSource = null
  let reconnectTimer = null
  let heartbeatCheckTimer = null
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
      lastHeartbeat.value = Date.now()
      startHeartbeatMonitor()

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

    // HEARTBEAT 이벤트 처리
    if (eventType === 'HEARTBEAT') {
      lastHeartbeat.value = Date.now()
      return
    }

    try {
      const data = JSON.parse(dataStr)

      const notification = {
        id: data.referenceId || data.id,
        type: eventType,
        title: getEventTitle(eventType),
        message: data.message,
        read: false,
        createdAt: data.createdAt || new Date().toISOString(),
        link: getEventLink(eventType, data),
        metadata: {
          reservationNumber: data.reservationNumber,
          customerName: data.customerName,
          serviceName: data.serviceName,
          staffName: data.staffName,
          rating: data.rating,
        },
      }

      store.addRealtimeNotification(notification)

      // Browser Notification API
      showBrowserNotification(notification)
    }
    catch {
      // ignore parse errors
    }
  }

  /**
   * 브라우저 Notification API를 이용한 알림 표시
   */
  function showBrowserNotification(notification) {
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      createBrowserNotification(notification)
    }
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          createBrowserNotification(notification)
        }
      })
    }
  }

  function createBrowserNotification(notification) {
    try {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id || notification.type,
        requireInteraction: false,
      })

      n.onclick = () => {
        window.focus()
        if (notification.link) {
          window.location.hash = notification.link
        }
        n.close()
      }

      // 자동 닫기 (5초 후)
      setTimeout(() => n.close(), 5000)
    }
    catch {
      // Service Worker 환경이 아닌 경우 등 무시
    }
  }

  /**
   * 브라우저 알림 권한 요청
   */
  function requestNotificationPermission() {
    if (!('Notification' in window)) return Promise.resolve('denied')
    if (Notification.permission === 'granted') return Promise.resolve('granted')
    return Notification.requestPermission()
  }

  function getEventTitle(eventType) {
    const titles = {
      RESERVATION_CREATED: '새 예약',
      NEW_RESERVATION: '새 예약',
      RESERVATION_CANCELLED: '예약 취소',
      REVIEW_CREATED: '새 리뷰',
      NEW_REVIEW: '새 리뷰',
      PAYMENT_COMPLETED: '결제 완료',
    }
    return titles[eventType] || '알림'
  }

  function getEventLink(eventType, _data) {
    if (eventType === 'RESERVATION_CREATED' || eventType === 'NEW_RESERVATION' || eventType === 'RESERVATION_CANCELLED') {
      return '/shop-admin/reservations'
    }
    if (eventType === 'PAYMENT_COMPLETED') {
      return '/shop-admin/payment/history'
    }
    if (eventType === 'REVIEW_CREATED' || eventType === 'NEW_REVIEW') {
      return '/shop-admin/reviews'
    }
    return null
  }

  function startHeartbeatMonitor() {
    stopHeartbeatMonitor()
    heartbeatCheckTimer = setInterval(() => {
      if (lastHeartbeat.value && Date.now() - lastHeartbeat.value > 45000) {
        // 45초 이상 heartbeat 미수신 → 재연결
        console.log('[SSE] Heartbeat timeout, reconnecting...')
        disconnect()
        connect()
      }
    }, 15000) // 15초마다 체크
  }

  function stopHeartbeatMonitor() {
    if (heartbeatCheckTimer) {
      clearInterval(heartbeatCheckTimer)
      heartbeatCheckTimer = null
    }
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
    stopHeartbeatMonitor()
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
    lastHeartbeat,
    connect,
    disconnect,
    requestNotificationPermission,
  }
}

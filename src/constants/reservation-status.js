export const RESERVATION_STATUS = {
  PENDING: { value: 'PENDING', label: '대기중', color: 'warning', icon: 'ri-time-line' },
  CONFIRMED: { value: 'CONFIRMED', label: '확정', color: 'info', icon: 'ri-check-line' },
  COMPLETED: { value: 'COMPLETED', label: '완료', color: 'success', icon: 'ri-check-double-line' },
  CANCELLED: { value: 'CANCELLED', label: '취소', color: 'error', icon: 'ri-close-line' },
  NO_SHOW: { value: 'NO_SHOW', label: '노쇼', color: 'secondary', icon: 'ri-user-unfollow-line' },
}

export function getStatusColor(status) {
  return RESERVATION_STATUS[status]?.color || 'secondary'
}

export function getStatusLabel(status) {
  return RESERVATION_STATUS[status]?.label || status
}

export function getStatusIcon(status) {
  return RESERVATION_STATUS[status]?.icon || 'ri-question-line'
}

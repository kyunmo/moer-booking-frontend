/**
 * 시간 포맷 유틸리티
 * 24시간제 시간 문자열을 한국어 오전/오후 표기로 변환
 */

/**
 * "HH:mm" 형식의 시간을 "오전/오후 H:mm" 형식으로 변환
 * @param {string} time - "14:00", "09:30" 등
 * @returns {string} "오후 2:00", "오전 9:30" 등
 */
export function formatTimeKR(time) {
  if (!time) return ''

  const [hourStr, minuteStr] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = minuteStr || '00'

  if (isNaN(hour)) return time

  if (hour === 0) return `오전 12:${minute}`
  if (hour < 12) return `오전 ${hour}:${minute}`
  if (hour === 12) return `오후 12:${minute}`

  return `오후 ${hour - 12}:${minute}`
}

/**
 * 시작 시간과 종료 시간을 "오전/오후 H:mm ~ 오전/오후 H:mm" 형식으로 변환
 * @param {string} startTime - "14:00" 등
 * @param {string} endTime - "16:00" 등
 * @returns {string} "오후 2:00 ~ 오후 4:00"
 */
export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return ''

  return `${formatTimeKR(startTime)} ~ ${formatTimeKR(endTime)}`
}

/**
 * 시작 시간 + 소요 시간(분)으로 종료 시간 계산
 * @param {string} startTime - "14:00" 등
 * @param {number} durationMinutes - 소요 시간(분)
 * @returns {string} "16:00" 등 (HH:mm 형식)
 */
export function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return ''

  const [hourStr, minuteStr] = startTime.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)

  if (isNaN(hour) || isNaN(minute)) return ''

  const totalMinutes = hour * 60 + minute + durationMinutes
  const endHour = Math.floor(totalMinutes / 60) % 24
  const endMinute = totalMinutes % 60

  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

/**
 * 서비스 목록의 소요시간 내역을 문자열로 반환
 * @param {Array} services - [{ name: '커트', duration: 30 }, { name: '펌', duration: 90 }]
 * @returns {string} "커트 30분 + 펌 90분"
 */
export function formatDurationBreakdown(services) {
  if (!services || services.length === 0) return ''

  return services.map(s => `${s.name} ${s.duration}분`).join(' + ')
}

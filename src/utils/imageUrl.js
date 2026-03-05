/**
 * 백엔드에서 반환하는 상대 경로를 절대 URL로 변환
 * 예: "/uploads/services/42/uuid.jpg" → "http://localhost:8080/uploads/services/42/uuid.jpg"
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
// API base URL에서 /api 부분 제거하여 서버 루트 URL 추출
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '')

export function resolveImageUrl(path) {
  if (!path) return null
  // 이미 절대 URL이면 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // 상대 경로를 서버 URL과 조합
  return `${SERVER_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export function resolveImageUrlOrFallback(imageUrl, thumbnailUrl) {
  // thumbnailUrl이 있으면 우선 사용, 없으면 imageUrl
  return resolveImageUrl(thumbnailUrl || imageUrl)
}

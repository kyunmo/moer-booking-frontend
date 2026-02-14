/**
 * 백엔드 이미지 상대 경로를 절대 URL로 변환
 * @param {string|null|undefined} path - 이미지 경로 (예: "/uploads/portfolios/xxx.jpg")
 * @returns {string|undefined} - 절대 URL 또는 undefined
 */
export function getImageUrl(path) {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '')

  return `${backendOrigin}${path}`
}

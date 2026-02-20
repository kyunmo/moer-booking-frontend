/**
 * OAuth Base URL
 * VITE_API_BASE_URL에서 /api 접미사를 제거하여 OAuth2 엔드포인트 베이스 URL을 생성
 * OAuth2 엔드포인트는 /api 접두사 없이 사용하기 때문
 */
export const OAUTH_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api$/, '')

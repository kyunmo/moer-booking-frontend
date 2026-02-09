import apiClient from './axios'

export default {
  // 로그인
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },

  // 로그아웃
  logout() {
    return apiClient.post('/auth/logout')
  },

  // 회원가입
  register(registerData) {
    return apiClient.post('/auth/register', registerData)
  },

  // 토큰 갱신
  refreshToken(refreshToken) {
    return apiClient.post('/auth/refresh', { refreshToken })
  },

  // 현재 사용자 정보 조회
  getCurrentUser() {
    return apiClient.get('/auth/me')
  },

  // 비밀번호 변경
  changePassword(passwordData) {
    return apiClient.post('/auth/change-password', passwordData)
  },

  // 비밀번호 찾기 (재설정 요청)
  forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email })
  },

  // 비밀번호 재설정 실행
  resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', { token, newPassword })
  },
}

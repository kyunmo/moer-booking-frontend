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

  // 프로필 정보 수정
  updateProfile(data) {
    return apiClient.patch('/auth/profile', data)
  },

  // 프로필 이미지 업로드
  uploadProfileImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post('/auth/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // SNS 연결 계정 목록 조회
  getSocialAccounts() {
    return apiClient.get('/auth/social-accounts')
  },

  // SNS 계정 연결 해제
  disconnectSocialAccount(provider) {
    return apiClient.delete(`/auth/social-accounts/${provider}`)
  },

  // 회원 탈퇴
  deleteAccount(data) {
    return apiClient.delete('/auth/account', { data })
  },
}

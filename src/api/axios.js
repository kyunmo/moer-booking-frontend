import { useTrialGuard } from '@/composables/useTrialGuard'
import axios from 'axios'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Public API 여부 판별
function isPublicApiRequest(config) {
  const url = config.url || ''
  return url.startsWith('/public/') || url.startsWith('public/')
}

// Customer API 여부 판별
function isCustomerApiRequest(config) {
  const url = config.url || ''
  return url.startsWith('/customer/') || url.startsWith('customer/')
}

// 요청 인터셉터 (JWT 토큰 자동 추가 + 슈퍼관리자 매장 ID)
apiClient.interceptors.request.use(
  config => {
    if (isPublicApiRequest(config)) {
      // Public API에는 인증 헤더를 보내지 않음
    }
    else if (isCustomerApiRequest(config)) {
      // Customer API에는 고객 토큰 사용
      const customerToken = localStorage.getItem('customerAccessToken')
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`
      }
    }
    else {
      // Admin API에는 관리자 토큰 사용
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 슈퍼관리자가 선택한 매장 ID를 헤더에 추가
      const selectedBusiness = localStorage.getItem('selectedBusinessForSuperAdmin')
      if (selectedBusiness) {
        try {
          const business = JSON.parse(selectedBusiness)
          if (business?.id) {
            config.headers['X-Business-Id'] = business.id
          }
        }
        catch (e) {
          // 파싱 실패 시 무시
        }
      }
    }

    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터 (에러 처리 및 토큰 갱신)
apiClient.interceptors.response.use(
  response => {
    return response.data // ApiResponse의 data 필드만 반환
  },
  async error => {
    const originalRequest = error.config

    if (error.response) {
      const { status, data } = error.response
      const errorCode = data?.error?.code
      const errorMessage = data?.error?.message || data?.message

      // 401 에러 (인증 실패)
      if (status === 401 && !originalRequest._retry) {
        // Public API 요청에서는 로그인 리다이렉트하지 않음
        if (isPublicApiRequest(originalRequest)) {
          // Public API는 인증 불필요 — 에러만 전달
        }
        // A003: 만료된 토큰 - 자동 갱신 시도
        else if (errorCode === 'A003') {
          originalRequest._retry = true

          // Customer API인 경우 고객 토큰 갱신
          if (isCustomerApiRequest(originalRequest)) {
            try {
              const refreshToken = localStorage.getItem('customerRefreshToken')

              if (refreshToken) {
                const refreshResponse = await axios.post(
                  `${apiClient.defaults.baseURL}/auth/refresh`,
                  { refreshToken },
                )

                const newAccessToken = refreshResponse.data.data?.accessToken

                localStorage.setItem('customerAccessToken', newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return apiClient(originalRequest)
              }
            }
            catch (refreshError) {
              localStorage.removeItem('customerAccessToken')
              localStorage.removeItem('customerRefreshToken')

              return Promise.reject(refreshError)
            }
          }
          else {
            try {
              const refreshToken = localStorage.getItem('refreshToken')

              if (refreshToken) {
                // 토큰 갱신 API 호출
                const refreshResponse = await axios.post(
                  `${apiClient.defaults.baseURL}/auth/refresh`,
                  { refreshToken },
                )

                const newAccessToken = refreshResponse.data.data?.accessToken

                // 새 토큰 저장
                localStorage.setItem('accessToken', newAccessToken)

                // 원래 요청에 새 토큰 적용하여 재시도
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return apiClient(originalRequest)
              }
            }
            catch (refreshError) {
              // 토큰 갱신 실패 시 로그아웃 처리
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'

              return Promise.reject(refreshError)
            }
          }
        }
        else if (isCustomerApiRequest(originalRequest)) {
          // 고객 API 인증 실패 시 고객 토큰만 정리 (관리자 로그인에 영향 없음)
          localStorage.removeItem('customerAccessToken')
          localStorage.removeItem('customerRefreshToken')
        }
        else {
          // A001, A002: 인증 필요, 유효하지 않은 토큰
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
      // 402 에러 (결제 필요)
      else if (status === 402) {
        // TR003: 업그레이드 필요
        if (errorCode === 'TR003') {
          const { showFeatureLockedDialog } = useTrialGuard()
          showFeatureLockedDialog(errorCode, errorMessage)
        }
      }
      // 403 에러 (권한 부족)
      else if (status === 403) {
        // TR001: 체험판 만료
        if (errorCode === 'TR001') {
          const { showTrialExpiredDialog } = useTrialGuard()
          showTrialExpiredDialog()
        }
        // TR002: 체험판 기능 제한
        else if (errorCode === 'TR002') {
          const { showFeatureLockedDialog } = useTrialGuard()
          showFeatureLockedDialog(errorCode, errorMessage)
        }
        // SL001/SL002/SL004: 사용량 제한 초과
        else if (errorCode === 'SL001' || errorCode === 'SL002' || errorCode === 'SL004') {
          const { showFeatureLockedDialog } = useTrialGuard()
          showFeatureLockedDialog(errorCode, errorMessage)
        }
        // C006: 접근 권한 없음
        else {
          // 접근 권한 없음
        }
      }
      // 404 에러
      else if (status === 404) {
        // 404: 리소스를 찾을 수 없음
      }
      // 409 에러 (충돌)
      else if (status === 409) {
        // U002: 이메일 중복
        if (errorCode === 'U002') {
          // 이메일 중복
        }
      }
      // 500 에러
      else if (status >= 500) {
        // 500+: 서버 오류
      }

      // 에러 메시지 반환 (에러 코드 포함)
      return Promise.reject({
        code: errorCode,
        message: errorMessage || '알 수 없는 오류가 발생했습니다.',
        details: error.response?.data?.error?.details,
        status,
      })
    }
    else if (error.request) {
      return Promise.reject({
        message: '서버에 연결할 수 없습니다.',
      })
    }
    else {
      return Promise.reject({
        message: error.message || '알 수 없는 오류가 발생했습니다.',
      })
    }
  },
)

export default apiClient

import axios from 'axios'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 (JWT 토큰 자동 추가)
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      
      // 401 에러 (인증 실패)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        // 토큰 갱신 시도
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          
          if (refreshToken) {
            // 토큰 갱신 API 호출
            const refreshResponse = await axios.post(
              `${apiClient.defaults.baseURL}/auth/refresh`,
              { refreshToken },
            )

            const { accessToken } = refreshResponse.data

            // 새 토큰 저장
            localStorage.setItem('accessToken', accessToken)

            // 원래 요청에 새 토큰 적용하여 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
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

        // refreshToken이 없으면 로그인 페이지로
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
      else if (status === 403) {
        console.error('접근 권한이 없습니다.')
      }
      else if (status === 404) {
        console.error('요청한 리소스를 찾을 수 없습니다.')
      }
      else if (status >= 500) {
        console.error('서버 오류가 발생했습니다.')
      }
      
      return Promise.reject(data?.message || '알 수 없는 오류가 발생했습니다.')
    }
    else if (error.request) {
      console.error('서버에 연결할 수 없습니다.')
      return Promise.reject('서버에 연결할 수 없습니다.')
    }
    else {
      return Promise.reject(error.message)
    }
  },
)

export default apiClient

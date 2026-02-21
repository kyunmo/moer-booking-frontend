import apiClient from './axios'

export default {
  submitInquiry(data) {
    return apiClient.post('/public/inquiries', data)
  },
}

import apiClient from './axios'

export default {
  getRevenue(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/statistics/revenue`, { params })
  },

  getReservations(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/statistics/reservations`, { params })
  },

  getCustomers(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/statistics/customers`, { params })
  },

  getStaff(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/statistics/staff`, { params })
  },

  getServices(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/statistics/services`, { params })
  },
}

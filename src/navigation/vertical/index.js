// 슈퍼 관리자 전용 메뉴
export const superAdminItems = [
  {
    heading: '슈퍼 관리자',
  },
  {
    title: '슈퍼 관리자',
    icon: { icon: 'ri-shield-star-line' },
    children: [
      {
        title: '대시보드',
        to: { name: 'shop-admin-super-dashboard' },
        icon: { icon: 'ri-dashboard-3-line' },
      },
      {
        title: '매장 관리',
        to: { name: 'shop-admin-super-businesses' },
        icon: { icon: 'ri-store-2-line' },
      },
      {
        title: '사용자 관리',
        to: { name: 'shop-admin-super-users' },
        icon: { icon: 'ri-user-settings-line' },
      },
      {
        title: '감사 로그',
        to: { name: 'shop-admin-super-audit-logs' },
        icon: { icon: 'ri-file-list-line' },
      },
    ],
  },
  {
    heading: '일반 메뉴',
  },
]

import { getBusinessTypeIcon } from '@/constants/businessTypes'
import { useAuthStore } from '@/stores/auth'

// 기본 메뉴 (모든 사용자)
export default [
  {
    title: '대시보드',
    to: { name: 'shop-admin-dashboard' },
    icon: { icon: 'ri-dashboard-line' },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
  },
  {
    title: '예약 관리',
    icon: { icon: 'ri-calendar-line' },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
    children: [
      {
        title: '예약 캘린더',
        to: { name: 'shop-admin-reservations-calendar' },
        icon: { icon: 'ri-calendar-event-line' },
      },
      {
        title: '예약 목록',
        to: { name: 'shop-admin-reservations-list' },
        icon: { icon: 'ri-list-check' },
      },
    ],
  },
  {
    title: '고객 관리',
    to: { name: 'shop-admin-customers-list' },
    icon: { icon: 'ri-user-line' },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
  },
  {
    title: '서비스 관리',
    to: { name: 'shop-admin-services-list' },
    get icon() {
      const authStore = useAuthStore()
      return { icon: getBusinessTypeIcon(authStore.businessType, 'line') }
    },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
  },
  {
    title: '스태프 관리',
    to: { name: 'shop-admin-staffs-list' },
    icon: { icon: 'ri-team-line' },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
  },
  {
    title: '구독 & 결제',
    icon: { icon: 'ri-vip-crown-line' },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
    children: [
      {
        title: '구독 관리',
        to: { name: 'shop-admin-subscription' },
        icon: { icon: 'ri-vip-crown-line' },
      },
      {
        title: '결제 내역',
        to: { name: 'shop-admin-payment-history' },
        icon: { icon: 'ri-file-list-line' },
      },
      {
        title: '쿠폰 관리',
        to: { name: 'shop-admin-coupon' },
        icon: { icon: 'ri-coupon-line' },
      },
    ],
  },
  {
    title: '설정',
    icon: { icon: 'ri-settings-3-line' },
    get disabled() {
      const authStore = useAuthStore()
      return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
    },
    children: [
      {
        title: '매장 설정',
        to: { name: 'shop-admin-business-settings' },
        icon: { icon: 'ri-store-2-line' },
      },
      {
        title: '영업시간',
        to: { name: 'shop-admin-business-settings-hours' },
        icon: { icon: 'ri-time-line' },
      },
      {
        title: '휴무일',
        to: { name: 'shop-admin-business-settings-holidays' },
        icon: { icon: 'ri-calendar-close-line' },
      },
    ],
  },
]

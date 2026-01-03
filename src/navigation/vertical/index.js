export default [
  {
    title: '대시보드',
    to: { name: 'root' },
    icon: { icon: 'ri-dashboard-line' },  // ← 변경
  },
  {
    title: '예약 관리',
    icon: { icon: 'ri-calendar-line' },  // ← 변경
    children: [
      {
        title: '예약 캘린더',
        to: { name: 'reservations-calendar' },
        icon: { icon: 'ri-calendar-event-line' },  // ← 변경
      },
      {
        title: '예약 목록',
        to: { name: 'reservations-list' },
        icon: { icon: 'ri-list-check' },  // ← 변경
      },
    ],
  },
  {
    title: '고객 관리',
    to: { name: 'customers-list' },
    icon: { icon: 'ri-user-line' },  // ← 변경
  },
  {
    title: '서비스 관리',
    to: { name: 'services-list' },
    icon: { icon: 'ri-scissors-line' },  // ← 변경
  },
  {
    title: '스태프 관리',
    to: { name: 'staffs-list' },
    icon: { icon: 'ri-team-line' },  // ← 변경
  },
  {
    title: '설정',
    icon: { icon: 'ri-settings-3-line' },  // ← 변경
    children: [
      {
        title: '매장 설정',
        to: { name: 'business-settings' },
        icon: { icon: 'ri-store-2-line' },  // ← 변경
      },
      {
        title: '영업시간',
        to: { name: 'business-settings-hours' },
        icon: { icon: 'ri-time-line' },  // ← 변경
      },
      {
        title: '휴무일',
        to: { name: 'business-settings-holidays' },
        icon: { icon: 'ri-calendar-close-line' },  // ← 변경
      },
    ],
  },
]

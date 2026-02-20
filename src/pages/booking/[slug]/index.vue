<route lang="yaml">
meta:
  layout: public
  public: true
  title: 매장 정보 - YEMO
  description: YEMO에서 매장 정보를 확인하고 간편하게 예약하세요.
</route>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { useSnackbar } from '@/composables/useSnackbar'
import publicBookingApi from '@/api/public-booking'
import { getBusinessTypeIcon } from '@/constants/businessTypes'
import KakaoMap from '@/components/public/KakaoMap.vue'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const customerAuthStore = useCustomerAuthStore()
const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)
const { success: showSuccess, error: showError } = useSnackbar()

// --- Route param ---
const slug = computed(() => route.params.slug)

// --- State ---
const activeTab = ref(0)
const notFound = ref(false)

// Review filters
const reviewPage = ref(1)
const reviewRatingFilter = ref(null)
const reviewServiceFilter = ref(null)
const reviewStaffFilter = ref(null)
const reviewSortBy = ref('latest')
const reviewLoading = ref(false)

// --- Computed ---
const business = computed(() => bookingStore.business)
const loading = computed(() => bookingStore.businessLoading)
const servicesByCategory = computed(() => bookingStore.servicesByCategory)
const businessHoursList = computed(() => bookingStore.businessHoursList)
const reviews = computed(() => bookingStore.reviews)
const reviewStats = computed(() => bookingStore.reviewStats)
const reviewTotalCount = computed(() => bookingStore.reviewTotalCount)

const reviewSortOptions = [
  { title: '최신순', value: 'latest' },
  { title: '별점 높은순', value: 'rating_high' },
  { title: '별점 낮은순', value: 'rating_low' },
]

const totalReviewPages = computed(() => {
  return Math.ceil(reviewTotalCount.value / 10) || 1
})

// 서비스 목록 (리뷰 필터용) - business.services에서 추출
const serviceFilterOptions = computed(() => {
  if (!business.value?.services) return []
  return business.value.services.map(s => ({
    title: s.name,
    value: s.name,
  }))
})

// 스태프 목록 (리뷰 필터용) - business.staffs에서 추출
const staffFilterOptions = computed(() => {
  if (!business.value?.staffs) return []
  return business.value.staffs.map(s => ({
    title: s.name,
    value: s.name,
  }))
})

// 클라이언트 측 서비스/스태프 필터링 (서버 파라미터와 병행)
const filteredReviews = computed(() => {
  let result = reviews.value
  if (reviewServiceFilter.value) {
    result = result.filter(r => r.serviceName === reviewServiceFilter.value)
  }
  if (reviewStaffFilter.value) {
    result = result.filter(r => r.staffName === reviewStaffFilter.value)
  }
  return result
})

const ratingDistributionBars = computed(() => {
  if (!reviewStats.value?.ratingDistribution) return []
  const dist = reviewStats.value.ratingDistribution
  const total = reviewStats.value.totalReviews || 1
  return [5, 4, 3, 2, 1].map(star => ({
    star,
    count: dist[String(star)] || 0,
    percentage: Math.round(((dist[String(star)] || 0) / total) * 100),
  }))
})

const todayDayKey = computed(() => {
  const dayIndex = new Date().getDay()
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayMap = {
    sun: '일요일',
    mon: '월요일',
    tue: '화요일',
    wed: '수요일',
    thu: '목요일',
    fri: '금요일',
    sat: '토요일',
  }
  return dayMap[keys[dayIndex]]
})

// 오늘의 영업시간 데이터 추출 (다양한 형식 대응)
function getTodayHoursData(businessHours) {
  if (!businessHours) return null

  const now = new Date()
  const dayIndex = now.getDay()
  // 약어 + 풀네임 매핑
  const dayMapping = [
    { abbr: 'sun', full: 'sunday' },
    { abbr: 'mon', full: 'monday' },
    { abbr: 'tue', full: 'tuesday' },
    { abbr: 'wed', full: 'wednesday' },
    { abbr: 'thu', full: 'thursday' },
    { abbr: 'fri', full: 'friday' },
    { abbr: 'sat', full: 'saturday' },
  ]
  const today = dayMapping[dayIndex]

  // 배열 형식
  if (Array.isArray(businessHours)) {
    const found = businessHours.find(h => {
      const key = (h.dayOfWeek || h.day || '').toLowerCase()
      return key === today.abbr || key === today.full || key.startsWith(today.abbr)
    })
    if (found) return { open: found.openTime || found.open, close: found.closeTime || found.close }
    return null
  }

  // 객체 형식 - 약어/풀네임/대문자 모두 시도
  const candidates = [today.abbr, today.full, today.abbr.toUpperCase(), today.full.toUpperCase()]
  for (const key of candidates) {
    const h = businessHours[key]
    if (!h) continue

    // Admin format: { isOpen, openTime, closeTime }
    if ('isOpen' in h) {
      return h.isOpen ? { open: h.openTime, close: h.closeTime } : null
    }
    // API format: { open, close }
    if (h.open || h.openTime) {
      return { open: h.open || h.openTime, close: h.close || h.closeTime }
    }
  }

  return null
}

// Business open/closed status
const isBusinessOpen = computed(() => {
  const todayHours = getTodayHoursData(business.value?.businessHours)
  if (!todayHours) return false

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return currentTime >= todayHours.open && currentTime <= todayHours.close
})

const todayBusinessHours = computed(() => {
  return getTodayHoursData(business.value?.businessHours)
})

// Holidays
const holidays = ref([])
const holidaysLoading = ref(false)

async function fetchHolidays() {
  holidaysLoading.value = true
  try {
    const year = new Date().getFullYear()
    const { data } = await publicBookingApi.getBusinessHolidays(slug.value, year)
    holidays.value = Array.isArray(data) ? data : (data?.items || [])
  } catch {
    holidays.value = []
  } finally {
    holidaysLoading.value = false
  }
}

// Portfolio dialog
const portfolioDialog = ref(false)
const portfolioStaff = ref(null)
const portfolioImages = ref([])
const portfolioLoading = ref(false)
const portfolioViewIndex = ref(0)
const portfolioViewDialog = ref(false)

async function openPortfolio(staff) {
  portfolioStaff.value = staff
  portfolioImages.value = []
  portfolioDialog.value = true
  portfolioLoading.value = true

  try {
    const { data } = await publicBookingApi.getStaffPortfolios(slug.value, staff.id)
    portfolioImages.value = data?.items || data || []
  }
  catch {
    showError('포트폴리오를 불러오지 못했습니다')
  }
  finally {
    portfolioLoading.value = false
  }
}

function openPortfolioImage(index) {
  portfolioViewIndex.value = index
  portfolioViewDialog.value = true
}

// --- Methods ---
async function fetchBusiness() {
  notFound.value = false
  try {
    await bookingStore.fetchBusinessDetail(slug.value)
  }
  catch {
    notFound.value = true
  }
}

async function fetchReviews() {
  reviewLoading.value = true
  try {
    await bookingStore.fetchPublicReviews(slug.value, {
      page: reviewPage.value,
      size: 10,
      rating: reviewRatingFilter.value,
      sortBy: reviewSortBy.value,
      serviceName: reviewServiceFilter.value || undefined,
      staffName: reviewStaffFilter.value || undefined,
    })
  }
  catch {
    // 리뷰 조회 실패 시 별도 처리 불필요 (빈 목록 유지)
  }
  finally {
    reviewLoading.value = false
  }
}

function goToReserve() {
  router.push(`/booking/${slug.value}/reserve`)
}

async function copyToClipboard(text, label) {
  try {
    await navigator.clipboard.writeText(text)
    showSuccess(`${label} 복사되었습니다`)
  }
  catch {
    showError('클립보드 복사에 실패했습니다')
  }
}

function formatPrice(price) {
  if (!price && price !== 0) return ''
  return price.toLocaleString() + '원'
}

function formatDuration(minutes) {
  if (!minutes) return ''
  return `${minutes}분`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatHours(hours) {
  if (!hours) return '휴무'
  return `${hours.open} - ${hours.close}`
}

// --- Watchers ---
watch(activeTab, (newTab) => {
  if (newTab === 2 && reviews.value.length === 0) {
    fetchReviews()
  }
})

watch([reviewRatingFilter, reviewSortBy, reviewServiceFilter, reviewStaffFilter], () => {
  reviewPage.value = 1
  fetchReviews()
})

watch(reviewPage, () => {
  fetchReviews()
})

// --- SEO Meta Tags ---
const originalTitle = document.title
const metaTags = []

function setMetaTag(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
    metaTags.push(tag)
  }
  tag.setAttribute('content', content)
}

watchEffect(() => {
  if (business.value) {
    const name = business.value.name
    const desc = business.value.description || `${name} 온라인 예약`

    document.title = `${name} - 예약 | YEMO`
    setMetaTag('og:title', `${name} - 온라인 예약`)
    setMetaTag('og:description', desc)
    setMetaTag('og:type', 'website')
    setMetaTag('og:url', window.location.href)
    if (business.value.profileImageUrl) {
      setMetaTag('og:image', business.value.profileImageUrl)
    }
  }
})

onUnmounted(() => {
  document.title = originalTitle
  metaTags.forEach(tag => tag.remove())
})

// --- Watchers for holidays ---
watch(() => business.value?.id, (newId) => {
  if (newId) {
    fetchHolidays()
  }
})

// --- Lifecycle ---
onMounted(() => {
  fetchBusiness()
})
</script>

<template>
  <div class="business-detail-page">
    <!-- Loading State -->
    <VContainer v-if="loading" class="py-16" style="max-inline-size: 1200px;">
      <VRow justify="center">
        <VCol cols="12" md="8">
          <VSkeletonLoader type="avatar, article, actions" class="mb-6" />
          <VSkeletonLoader type="table-heading, table-tbody" />
        </VCol>
      </VRow>
    </VContainer>

    <!-- Not Found State -->
    <VContainer v-else-if="notFound" class="py-16" style="max-inline-size: 1200px;">
      <VRow justify="center">
        <VCol cols="12" md="6" class="text-center">
          <VIcon icon="ri-store-2-line" size="80" color="medium-emphasis" class="mb-4" />
          <h2 class="text-h4 font-weight-bold mb-2">
            매장을 찾을 수 없습니다
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            요청하신 매장 정보가 존재하지 않거나 삭제되었습니다.
          </p>
          <VBtn color="primary" variant="outlined" @click="router.push('/')">
            <VIcon icon="ri-home-line" start />
            홈으로 돌아가기
          </VBtn>
        </VCol>
      </VRow>
    </VContainer>

    <!-- Business Detail -->
    <template v-else-if="business">
      <!-- Back to Search -->
      <VContainer style="max-inline-size: 1200px;" class="py-2">
        <VBtn
          variant="text"
          color="primary"
          size="small"
          prepend-icon="ri-arrow-left-s-line"
          @click="router.push('/booking')"
        >
          매장 검색으로 돌아가기
        </VBtn>
      </VContainer>

      <!-- Cover Image Section -->
      <section class="business-cover">
        <VImg
          v-if="business.coverImageUrl"
          :src="business.coverImageUrl"
          :alt="`${business.name} 커버`"
          height="220"
          cover
          class="d-none d-md-block"
        />
        <VImg
          v-if="business.coverImageUrl"
          :src="business.coverImageUrl"
          :alt="`${business.name} 커버`"
          height="160"
          cover
          class="d-md-none"
        />
        <!-- Fallback gradient when no cover image -->
        <div
          v-if="!business.coverImageUrl"
          class="business-cover-gradient"
        />
      </section>

      <!-- Header Section -->
      <section class="business-header-section py-8 py-md-12">
        <VContainer style="max-inline-size: 1200px;">
          <VRow align="center">
            <VCol cols="12" md="8">
              <div class="d-flex align-start gap-4 flex-column flex-sm-row">
                <!-- Profile Image -->
                <VAvatar size="80" rounded="lg" color="primary" variant="tonal">
                  <VImg
                    v-if="business.profileImageUrl"
                    :src="business.profileImageUrl"
                    :alt="business.name"
                    cover
                  />
                  <VIcon v-else icon="ri-store-2-line" size="40" />
                </VAvatar>

                <div class="flex-grow-1">
                  <!-- Business Name -->
                  <h1 class="text-h4 text-md-h3 font-weight-bold mb-2">
                    {{ business.name }}
                  </h1>

                  <!-- Business Status -->
                  <div class="d-flex align-center ga-2 mb-2">
                    <VChip
                      :color="isBusinessOpen ? 'success' : 'error'"
                      size="small"
                      label
                    >
                      <VIcon start size="14">
                        {{ isBusinessOpen ? 'ri-checkbox-circle-line' : 'ri-close-circle-line' }}
                      </VIcon>
                      {{ isBusinessOpen ? '영업중' : '영업종료' }}
                    </VChip>
                    <span v-if="todayBusinessHours" class="text-body-2 text-medium-emphasis">
                      오늘 {{ todayBusinessHours.open }} - {{ todayBusinessHours.close }}
                    </span>
                    <span v-else class="text-body-2 text-error">
                      오늘 휴무
                    </span>
                  </div>

                  <!-- Rating -->
                  <div class="d-flex align-center gap-2 mb-3">
                    <VRating
                      :model-value="business.averageRating || 0"
                      readonly
                      half-increments
                      density="compact"
                      color="warning"
                      active-color="warning"
                      size="small"
                    />
                    <span class="text-body-1 font-weight-medium">
                      {{ (business.averageRating || 0).toFixed(1) }}
                    </span>
                    <span class="text-body-2 text-medium-emphasis">
                      ({{ business.reviewCount || 0 }}개의 리뷰)
                    </span>
                  </div>

                  <!-- Address -->
                  <div v-if="business.address" class="d-flex align-center gap-1 mb-1">
                    <VIcon icon="ri-map-pin-line" size="18" color="medium-emphasis" />
                    <span class="text-body-2 text-medium-emphasis">
                      {{ business.address }}
                      <template v-if="business.addressDetail"> {{ business.addressDetail }}</template>
                    </span>
                    <VBtn
                      icon
                      size="x-small"
                      variant="text"
                      @click="copyToClipboard(business.address, '주소가')"
                    >
                      <VIcon icon="ri-file-copy-line" size="16" />
                      <VTooltip activator="parent" location="top">
                        주소 복사
                      </VTooltip>
                    </VBtn>
                  </div>

                  <!-- Phone -->
                  <div v-if="business.phone" class="d-flex align-center gap-1 mb-3">
                    <VIcon icon="ri-phone-line" size="18" color="medium-emphasis" />
                    <a
                      :href="`tel:${business.phone}`"
                      class="text-body-2 text-medium-emphasis text-decoration-none"
                      aria-label="전화 걸기"
                    >
                      {{ business.phone }}
                    </a>
                    <VBtn
                      icon
                      size="x-small"
                      variant="text"
                      @click="copyToClipboard(business.phone, '전화번호가')"
                    >
                      <VIcon icon="ri-file-copy-line" size="16" />
                      <VTooltip activator="parent" location="top">
                        전화번호 복사
                      </VTooltip>
                    </VBtn>
                  </div>

                  <!-- 전화 문의 버튼 (모바일 강조) -->
                  <VBtn
                    v-if="business.phone"
                    :href="`tel:${business.phone}`"
                    tag="a"
                    color="success"
                    variant="tonal"
                    size="small"
                    class="mb-3"
                    aria-label="전화 걸기"
                  >
                    <VIcon icon="ri-phone-fill" start />
                    전화 문의
                  </VBtn>

                  <!-- Chips: Business Type + Tags -->
                  <div class="d-flex flex-wrap gap-2">
                    <VChip
                      v-if="business.businessType"
                      size="small"
                      color="primary"
                      variant="tonal"
                    >
                      {{ business.businessType }}
                    </VChip>
                    <VChip
                      v-for="tag in (business.tags || [])"
                      :key="tag"
                      size="small"
                      variant="outlined"
                    >
                      {{ tag }}
                    </VChip>
                  </div>
                </div>
              </div>
            </VCol>

            <!-- Reserve Button (Desktop) -->
            <VCol cols="12" md="4" class="text-md-end d-none d-md-block">
              <VBtn
                color="primary"
                size="large"
                prepend-icon="ri-calendar-check-line"
                @click="goToReserve"
              >
                예약하기
              </VBtn>
            </VCol>
          </VRow>

          <!-- Description -->
          <p v-if="business.description" class="text-body-1 text-medium-emphasis mt-4 mb-0">
            {{ business.description }}
          </p>
        </VContainer>
      </section>

      <VDivider />

      <!-- Tabs Section -->
      <section>
        <VContainer style="max-inline-size: 1200px;">
          <VTabs v-model="activeTab" class="mb-6">
            <VTab :value="0">
              <VIcon :icon="getBusinessTypeIcon(business.businessType)" start />
              서비스
            </VTab>
            <VTab :value="1">
              <VIcon icon="ri-team-line" start />
              스태프
            </VTab>
            <VTab :value="2">
              <VIcon icon="ri-star-line" start />
              리뷰
            </VTab>
            <VTab :value="3">
              <VIcon icon="ri-information-line" start />
              정보
            </VTab>
          </VTabs>

          <VWindow v-model="activeTab">
            <!-- Tab 1: Services -->
            <VWindowItem :value="0">
              <div v-if="Object.keys(servicesByCategory).length === 0" class="text-center py-12">
                <VIcon icon="ri-scissors-line" size="48" color="medium-emphasis" class="mb-3" />
                <p class="text-body-1 text-medium-emphasis">
                  등록된 서비스가 없습니다.
                </p>
              </div>

              <div
                v-for="(services, categoryName) in servicesByCategory"
                :key="categoryName"
                class="mb-8"
              >
                <h3 class="text-h6 font-weight-bold mb-4">
                  {{ categoryName }}
                </h3>

                <VCard
                  v-for="service in services"
                  :key="service.id"
                  variant="outlined"
                  class="mb-3"
                >
                  <VCardText class="d-flex align-center justify-space-between flex-wrap gap-3">
                    <div class="flex-grow-1" style="min-inline-size: 200px;">
                      <div class="text-subtitle-1 font-weight-bold mb-1">
                        {{ service.name }}
                      </div>
                      <div v-if="service.description" class="text-body-2 text-medium-emphasis">
                        {{ service.description }}
                      </div>
                    </div>
                    <div class="text-end" style="min-inline-size: 120px;">
                      <div class="text-subtitle-1 font-weight-bold text-primary">
                        {{ formatPrice(service.price) }}
                      </div>
                      <div v-if="service.duration" class="text-body-2 text-medium-emphasis">
                        {{ formatDuration(service.duration) }}
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </div>
            </VWindowItem>

            <!-- Tab 2: Staff -->
            <VWindowItem :value="1">
              <div v-if="!business.staffs?.length" class="text-center py-12">
                <VIcon icon="ri-team-line" size="48" color="medium-emphasis" class="mb-3" />
                <p class="text-body-1 text-medium-emphasis">
                  등록된 스태프가 없습니다.
                </p>
              </div>

              <VRow v-else>
                <VCol
                  v-for="staff in business.staffs"
                  :key="staff.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <VCard class="h-100" variant="outlined">
                    <VCardText class="text-center pa-6">
                      <VAvatar size="64" color="primary" variant="tonal" class="mb-3">
                        <VImg
                          v-if="staff.profileImageUrl"
                          :src="staff.profileImageUrl"
                          :alt="staff.name"
                          cover
                        />
                        <VIcon v-else icon="ri-user-line" size="32" />
                      </VAvatar>

                      <div class="text-subtitle-1 font-weight-bold mb-1">
                        {{ staff.name }}
                      </div>

                      <VChip
                        v-if="staff.position"
                        size="small"
                        color="primary"
                        variant="tonal"
                        class="mb-3"
                      >
                        {{ staff.position }}
                      </VChip>

                      <p v-if="staff.introduction" class="text-body-2 text-medium-emphasis mb-2">
                        {{ staff.introduction }}
                      </p>

                      <div v-if="staff.specialty" class="text-caption text-medium-emphasis mb-2">
                        <VIcon icon="ri-medal-line" size="14" class="me-1" />
                        {{ staff.specialty }}
                      </div>

                      <VChip
                        v-if="staff.portfolioCount > 0"
                        size="small"
                        variant="tonal"
                        color="info"
                        class="cursor-pointer"
                        @click="openPortfolio(staff)"
                      >
                        <VIcon icon="ri-image-line" start size="14" />
                        포트폴리오 {{ staff.portfolioCount }}건
                      </VChip>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- Tab 3: Reviews -->
            <VWindowItem :value="2">
              <!-- Review Write Button -->
              <VCard variant="tonal" color="primary" class="mb-6">
                <VCardText class="d-flex align-center justify-space-between flex-wrap gap-3 pa-4">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">
                      서비스를 이용하셨나요?
                    </div>
                    <div v-if="isCustomerLoggedIn" class="text-body-2 text-medium-emphasis">
                      이용하신 서비스에 대한 리뷰를 남겨주세요
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      로그인 후 리뷰를 작성할 수 있습니다
                    </div>
                  </div>
                  <VBtn
                    v-if="isCustomerLoggedIn"
                    color="primary"
                    variant="elevated"
                    @click="router.push(`/booking/${slug}/review`)"
                  >
                    <VIcon start>
                      ri-edit-line
                    </VIcon>
                    리뷰 작성
                  </VBtn>
                  <VBtn
                    v-else
                    color="primary"
                    variant="elevated"
                    @click="router.push(`/booking/login?redirect=/booking/${slug}/review`)"
                  >
                    <VIcon start>
                      ri-edit-line
                    </VIcon>
                    리뷰 작성
                  </VBtn>
                </VCardText>
              </VCard>

              <!-- Review Stats -->
              <VCard v-if="reviewStats" variant="outlined" class="mb-6">
                <VCardText>
                  <VRow align="center">
                    <!-- Average Rating -->
                    <VCol cols="12" sm="4" class="text-center">
                      <div class="text-h2 font-weight-bold text-primary mb-1">
                        {{ (reviewStats.averageRating || 0).toFixed(1) }}
                      </div>
                      <VRating
                        :model-value="reviewStats.averageRating || 0"
                        readonly
                        half-increments
                        density="compact"
                        color="warning"
                        active-color="warning"
                        size="small"
                      />
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        {{ reviewStats.totalReviews || 0 }}개의 리뷰
                      </div>
                    </VCol>

                    <!-- Rating Distribution -->
                    <VCol cols="12" sm="8">
                      <div
                        v-for="bar in ratingDistributionBars"
                        :key="bar.star"
                        class="d-flex align-center gap-3 mb-2"
                      >
                        <span class="text-body-2" style="min-inline-size: 36px;">
                          {{ bar.star }}점
                        </span>
                        <VProgressLinear
                          :model-value="bar.percentage"
                          color="warning"
                          rounded
                          height="8"
                          class="flex-grow-1"
                        />
                        <span class="text-body-2 text-medium-emphasis" style="min-inline-size: 36px;">
                          {{ bar.count }}
                        </span>
                      </div>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>

              <!-- Review Filters -->
              <div class="d-flex flex-wrap align-center gap-4 mb-4">
                <VBtnToggle
                  v-model="reviewRatingFilter"
                  mandatory
                  density="compact"
                  variant="outlined"
                  divided
                >
                  <VBtn :value="null" size="small">
                    전체
                  </VBtn>
                  <VBtn v-for="star in [5, 4, 3, 2, 1]" :key="star" :value="star" size="small">
                    {{ star }}점
                  </VBtn>
                </VBtnToggle>

                <VSelect
                  v-model="reviewSortBy"
                  :items="reviewSortOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="max-inline-size: 160px;"
                />
              </div>

              <!-- Service & Staff Filters -->
              <div class="d-flex flex-wrap align-center gap-4 mb-6">
                <VSelect
                  v-if="serviceFilterOptions.length > 0"
                  v-model="reviewServiceFilter"
                  :items="serviceFilterOptions"
                  label="서비스 필터"
                  density="compact"
                  variant="outlined"
                  hide-details
                  clearable
                  prepend-inner-icon="ri-scissors-line"
                  style="max-inline-size: 220px;"
                />

                <VSelect
                  v-if="staffFilterOptions.length > 0"
                  v-model="reviewStaffFilter"
                  :items="staffFilterOptions"
                  label="스태프 필터"
                  density="compact"
                  variant="outlined"
                  hide-details
                  clearable
                  prepend-inner-icon="ri-user-line"
                  style="max-inline-size: 220px;"
                />
              </div>

              <!-- Review Loading -->
              <div v-if="reviewLoading" class="py-8">
                <VSkeletonLoader v-for="i in 3" :key="i" type="list-item-three-line" class="mb-4" />
              </div>

              <!-- Review List -->
              <template v-else>
                <div v-if="filteredReviews.length === 0" class="text-center py-12">
                  <VIcon icon="ri-chat-smile-3-line" size="48" color="medium-emphasis" class="mb-3" />
                  <p class="text-body-1 text-medium-emphasis">
                    {{ (reviewServiceFilter || reviewStaffFilter) ? '선택한 필터에 맞는 리뷰가 없습니다.' : '아직 리뷰가 없습니다.' }}
                  </p>
                </div>

                <VCard
                  v-for="review in filteredReviews"
                  :key="review.id"
                  variant="outlined"
                  class="mb-4"
                >
                  <VCardText>
                    <!-- Review Header -->
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div class="d-flex align-center gap-2">
                        <VAvatar size="32" color="primary" variant="tonal">
                          <span class="text-body-2">{{ (review.customerName || '')[0] }}</span>
                        </VAvatar>
                        <span class="text-subtitle-2 font-weight-bold">
                          {{ review.customerName }}
                        </span>
                      </div>
                      <span class="text-caption text-medium-emphasis">
                        {{ formatDate(review.createdAt) }}
                      </span>
                    </div>

                    <!-- Rating -->
                    <VRating
                      :model-value="review.rating"
                      readonly
                      density="compact"
                      color="warning"
                      active-color="warning"
                      size="x-small"
                      class="mb-2"
                    />

                    <!-- Content -->
                    <p class="text-body-2 mb-3">
                      {{ review.content }}
                    </p>

                    <!-- Service & Staff Chips -->
                    <div class="d-flex flex-wrap gap-2 mb-2">
                      <VChip v-if="review.serviceName" size="small" variant="tonal" color="primary">
                        <VIcon icon="ri-scissors-line" start size="14" />
                        {{ review.serviceName }}
                      </VChip>
                      <VChip v-if="review.staffName" size="small" variant="tonal" color="info">
                        <VIcon icon="ri-user-line" start size="14" />
                        {{ review.staffName }}
                      </VChip>
                    </div>

                    <!-- Reply -->
                    <VAlert
                      v-if="review.reply"
                      variant="tonal"
                      color="primary"
                      density="compact"
                      class="mt-3"
                    >
                      <template #prepend>
                        <VIcon icon="ri-reply-line" />
                      </template>
                      <div class="text-body-2 mb-1">
                        {{ review.reply.content }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatDate(review.reply.createdAt) }}
                      </div>
                    </VAlert>
                  </VCardText>
                </VCard>

                <!-- Pagination -->
                <div v-if="totalReviewPages > 1" class="d-flex justify-center mt-6">
                  <VPagination
                    v-model="reviewPage"
                    :length="totalReviewPages"
                    :total-visible="5"
                    rounded
                  />
                </div>
              </template>
            </VWindowItem>

            <!-- Tab 4: Info -->
            <VWindowItem :value="3">
              <!-- Business Hours -->
              <VCard variant="outlined" class="mb-6">
                <VCardTitle class="text-subtitle-1 font-weight-bold">
                  <VIcon icon="ri-time-line" start />
                  영업시간
                </VCardTitle>
                <VDivider />
                <VList density="compact">
                  <VListItem
                    v-for="item in businessHoursList"
                    :key="item.day"
                    :class="{ 'bg-primary-lighten-5': item.day === todayDayKey }"
                  >
                    <template #prepend>
                      <VChip
                        v-if="item.day === todayDayKey"
                        size="x-small"
                        color="primary"
                        class="me-2"
                      >
                        오늘
                      </VChip>
                    </template>
                    <VListItemTitle class="d-flex justify-space-between">
                      <span :class="{ 'font-weight-bold': item.day === todayDayKey }">
                        {{ item.day }}
                      </span>
                      <span
                        :class="[
                          item.hours ? 'text-body-2' : 'text-body-2 text-error',
                          { 'font-weight-bold': item.day === todayDayKey },
                        ]"
                      >
                        {{ formatHours(item.hours) }}
                      </span>
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VCard>

              <!-- Holidays -->
              <VCard variant="outlined" class="mb-6">
                <VCardTitle class="text-subtitle-1 font-weight-bold">
                  <VIcon icon="ri-calendar-close-line" start />
                  휴무일 안내
                </VCardTitle>
                <VDivider />
                <VCardText v-if="holidays.length > 0">
                  <div
                    v-for="holiday in holidays"
                    :key="holiday.id || holiday.date"
                    class="d-flex align-center justify-space-between py-2"
                  >
                    <div class="d-flex align-center ga-2">
                      <VIcon icon="ri-calendar-event-line" size="18" color="error" />
                      <span class="text-body-2">{{ holiday.date }}</span>
                    </div>
                    <VChip
                      v-if="holiday.reason || holiday.name"
                      size="x-small"
                      variant="tonal"
                      color="error"
                    >
                      {{ holiday.reason || holiday.name }}
                    </VChip>
                  </div>
                </VCardText>
                <VCardText v-else class="text-body-2 text-medium-emphasis">
                  등록된 휴무일이 없습니다.
                </VCardText>
              </VCard>

              <!-- Address -->
              <VCard v-if="business.address" variant="outlined" class="mb-6">
                <VCardTitle class="text-subtitle-1 font-weight-bold">
                  <VIcon icon="ri-map-pin-line" start />
                  주소
                </VCardTitle>
                <VDivider />
                <VCardText>
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">{{ business.address }}</span>
                    <VBtn
                    icon
                    size="small"
                    variant="text"
                    @click="copyToClipboard(business.address, '주소가')"
                  >
                    <VIcon icon="ri-file-copy-line" />
                    <VTooltip activator="parent" location="top">
                      주소 복사
                    </VTooltip>
                  </VBtn>
                  </div>
                  <div v-if="business.addressDetail" class="text-body-2 text-medium-emphasis mt-1">
                    {{ business.addressDetail }}
                  </div>

                  <!-- Kakao Map -->
                  <div class="mt-4">
                    <KakaoMap
                      :address="business.address"
                      :address-detail="business.addressDetail"
                      :latitude="business.latitude"
                      :longitude="business.longitude"
                      :business-name="business.name"
                      :height="280"
                    />
                  </div>
                </VCardText>
              </VCard>

              <!-- Phone -->
              <VCard v-if="business.phone" variant="outlined" class="mb-6">
                <VCardTitle class="text-subtitle-1 font-weight-bold">
                  <VIcon icon="ri-phone-line" start />
                  전화번호
                </VCardTitle>
                <VDivider />
                <VCardText>
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-1">{{ business.phone }}</span>
                    <VBtn
                      :href="`tel:${business.phone}`"
                      tag="a"
                      color="success"
                      variant="elevated"
                      size="default"
                      prepend-icon="ri-phone-fill"
                    >
                      전화 걸기
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </VWindowItem>
          </VWindow>
        </VContainer>
      </section>

      <!-- Portfolio Gallery Dialog -->
      <VDialog v-model="portfolioDialog" max-width="700" scrollable>
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VAvatar color="primary" variant="tonal" size="32" class="me-3">
              <VImg
                v-if="portfolioStaff?.profileImageUrl"
                :src="portfolioStaff.profileImageUrl"
                :alt="`${portfolioStaff?.name} 프로필 사진`"
                cover
              />
              <VIcon v-else icon="ri-user-line" size="18" />
            </VAvatar>
            <span>{{ portfolioStaff?.name }} 포트폴리오</span>
            <VSpacer />
            <VBtn icon variant="text" size="small" aria-label="닫기" @click="portfolioDialog = false">
              <VIcon icon="ri-close-line" />
            </VBtn>
          </VCardTitle>

          <VDivider />

          <VCardText class="pa-4">
            <!-- Loading -->
            <div v-if="portfolioLoading" class="text-center py-8">
              <VProgressCircular indeterminate color="primary" />
            </div>

            <!-- Empty -->
            <div v-else-if="portfolioImages.length === 0" class="text-center py-8">
              <VIcon icon="ri-image-line" size="48" color="medium-emphasis" class="mb-3" />
              <p class="text-body-1 text-medium-emphasis">
                포트폴리오 이미지가 없습니다
              </p>
            </div>

            <!-- Gallery Grid -->
            <VRow v-else>
              <VCol
                v-for="(item, index) in portfolioImages"
                :key="item.id || index"
                cols="6"
                sm="4"
              >
                <VCard
                  variant="outlined"
                  class="cursor-pointer portfolio-thumb"
                  rounded="lg"
                  @click="openPortfolioImage(index)"
                >
                  <VImg
                    :src="item.imageUrl || item.url"
                    :alt="item.title || `포트폴리오 ${index + 1}`"
                    aspect-ratio="1"
                    cover
                  />
                  <VCardText v-if="item.title" class="pa-2 text-caption text-center">
                    {{ item.title }}
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VDialog>

      <!-- Portfolio Image Viewer -->
      <VDialog v-model="portfolioViewDialog" max-width="900">
        <VCard color="black">
          <VBtn
            icon
            variant="text"
            size="small"
            color="white"
            class="portfolio-view-close"
            @click="portfolioViewDialog = false"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>

          <VCarousel
            v-model="portfolioViewIndex"
            :show-arrows="portfolioImages.length > 1"
            hide-delimiters
            height="80vh"
          >
            <VCarouselItem
              v-for="(item, index) in portfolioImages"
              :key="item.id || index"
              :src="item.imageUrl || item.url"
              cover
            />
          </VCarousel>
        </VCard>
      </VDialog>

      <!-- Mobile FAB -->
      <VBtn
        class="d-md-none mobile-fab"
        color="primary"
        size="large"
        prepend-icon="ri-calendar-check-line"
        rounded="xl"
        elevation="8"
        @click="goToReserve"
      >
        예약하기
      </VBtn>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.business-detail-page {
  width: 100%;
  padding-block-end: 136px; // FAB(56px) + BottomNav(56px) + gap(24px)

  @media (min-width: 600px) {
    padding-block-end: 0; // sm and up: no bottom nav
  }
}

.business-cover-gradient {
  block-size: 180px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.15) 0%,
    rgba(var(--v-theme-info), 0.1) 50%,
    rgba(var(--v-theme-success), 0.08) 100%
  );

  @media (min-width: 960px) {
    block-size: 220px;
  }
}

.business-header-section {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%);
}

.mobile-fab {
  position: fixed;
  inset-block-end: 80px; // Above VBottomNavigation (56px + 24px gap)
  inset-inline-end: 24px;
  z-index: 100;
}

// Today's business hours row highlight
:deep(.bg-primary-lighten-5) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.portfolio-thumb {
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.03);
  }
}

.portfolio-view-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>

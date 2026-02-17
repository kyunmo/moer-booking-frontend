<route lang="yaml">
meta:
  layout: public
  public: true
  title: 매장 검색 - YEMO
</route>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useSnackbar } from '@/composables/useSnackbar'
import { BUSINESS_TYPE_OPTIONS, getBusinessTypeLabel } from '@/constants/businessTypes'

const router = useRouter()
const bookingStore = useBookingStore()
const { error: showError } = useSnackbar()

// Search form state
const keyword = ref('')
const businessType = ref('')
const sortBy = ref('rating')
const page = ref(1)
const pageSize = 12

// Business type options with "전체" at start
const typeOptions = computed(() => [
  { title: '전체', value: '' },
  ...BUSINESS_TYPE_OPTIONS,
])

// Store state
const businesses = computed(() => bookingStore.businesses)
const loading = computed(() => bookingStore.searchLoading)
const pageInfo = computed(() => bookingStore.pageInfo)
const totalPages = computed(() => pageInfo.value?.totalPages || 0)

// Search function
async function search() {
  const params = {
    page: page.value,
    size: pageSize,
    sort: sortBy.value,
  }

  if (keyword.value.trim()) {
    params.keyword = keyword.value.trim()
  }

  if (businessType.value) {
    params.businessType = businessType.value
  }

  try {
    await bookingStore.searchBusinesses(params)
  }
  catch (err) {
    showError('매장 검색 중 오류가 발생했습니다')
  }
}

// Navigate to business detail
function goToDetail(business) {
  router.push(`/booking/${business.slug}`)
}

// Handle search form submit
function handleSearch() {
  page.value = 1
  search()
}

// Handle Enter key
function handleKeydown(e) {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

// Re-search when sort changes
watch(sortBy, () => {
  page.value = 1
  search()
})

// Re-search when page changes
watch(page, () => {
  search()
})

// Placeholder image for businesses without profile image
const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22200%22%20viewBox%3D%220%200%20400%20200%22%3E%3Crect%20fill%3D%22%23E0E0E0%22%20width%3D%22400%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%239E9E9E%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'

// Initial load
onMounted(() => {
  search()
})
</script>

<template>
  <div class="booking-search-page">
    <!-- Hero Section -->
    <section class="hero-section py-16">
      <VContainer>
        <VRow justify="center">
          <VCol cols="12" md="10" lg="8">
            <div class="text-center mb-8">
              <h1 class="text-h3 text-md-h2 font-weight-bold text-white mb-3">
                내 주변 매장 찾기
              </h1>
              <p class="text-h6 text-white" style="opacity: 0.85;">
                원하는 매장을 검색하고 바로 예약하세요
              </p>
            </div>

            <!-- Search Bar -->
            <VCard class="pa-4" rounded="xl" elevation="8">
              <VRow align="center" no-gutters>
                <VCol cols="12" sm="5">
                  <VTextField
                    v-model="keyword"
                    label="매장명, 지역으로 검색"
                    prepend-inner-icon="ri-search-line"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    @keydown="handleKeydown"
                  />
                </VCol>

                <VCol cols="12" sm="4" class="mt-3 mt-sm-0 ms-sm-3">
                  <VSelect
                    v-model="businessType"
                    :items="typeOptions"
                    label="업종"
                    prepend-inner-icon="ri-store-2-line"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </VCol>

                <VCol cols="12" sm="auto" class="mt-3 mt-sm-0 ms-sm-3">
                  <VBtn
                    color="primary"
                    size="large"
                    block
                    min-width="120"
                    @click="handleSearch"
                  >
                    <VIcon start>
                      ri-search-line
                    </VIcon>
                    검색
                  </VBtn>
                </VCol>
              </VRow>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- Results Section -->
    <section class="results-section py-8">
      <VContainer style="max-inline-size: 1200px;">
        <!-- Sort Controls -->
        <div class="d-flex align-center justify-space-between mb-6">
          <div class="text-body-1 text-medium-emphasis">
            <template v-if="pageInfo && !loading">
              총 <strong class="text-high-emphasis">{{ pageInfo.totalElements }}</strong>개의 매장
            </template>
          </div>

          <VBtnToggle
            v-model="sortBy"
            mandatory
            density="compact"
            variant="outlined"
            divided
            color="primary"
          >
            <VBtn value="rating" size="small">
              <VIcon start size="18">
                ri-star-line
              </VIcon>
              평점순
            </VBtn>
            <VBtn value="name" size="small">
              <VIcon start size="18">
                ri-sort-alphabet-asc
              </VIcon>
              이름순
            </VBtn>
          </VBtnToggle>
        </div>

        <!-- Loading State -->
        <VRow v-if="loading">
          <VCol
            v-for="n in 6"
            :key="n"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard rounded="lg">
              <VSkeletonLoader type="image, article, chip" />
            </VCard>
          </VCol>
        </VRow>

        <!-- Empty State -->
        <div
          v-else-if="businesses.length === 0"
          class="text-center py-16"
        >
          <VIcon
            icon="ri-store-2-line"
            size="80"
            color="grey-lighten-1"
            class="mb-4"
          />
          <h3 class="text-h5 text-medium-emphasis mb-2">
            검색 결과가 없습니다
          </h3>
          <p class="text-body-1 text-medium-emphasis">
            다른 검색어 또는 업종으로 다시 검색해보세요
          </p>
        </div>

        <!-- Business Cards Grid -->
        <VRow v-else>
          <VCol
            v-for="business in businesses"
            :key="business.id"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard
              class="business-card h-100 cursor-pointer"
              rounded="lg"
              hover
              @click="goToDetail(business)"
            >
              <!-- Profile Image -->
              <VImg
                :src="business.profileImageUrl || placeholderImage"
                height="180"
                cover
                class="bg-grey-lighten-3"
              >
                <!-- Open/Closed Badge -->
                <div class="pa-3 d-flex justify-end">
                  <VChip
                    :color="business.open ? 'success' : 'grey'"
                    size="small"
                    label
                  >
                    <VIcon start size="14">
                      {{ business.open ? 'ri-time-line' : 'ri-time-fill' }}
                    </VIcon>
                    {{ business.open ? '영업중' : '영업종료' }}
                  </VChip>
                </div>
              </VImg>

              <VCardText class="pb-2">
                <!-- Business Name + Type -->
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6 font-weight-bold text-truncate me-2">
                    {{ business.name }}
                  </h3>
                  <VChip
                    size="x-small"
                    variant="tonal"
                    color="primary"
                  >
                    {{ getBusinessTypeLabel(business.businessType) }}
                  </VChip>
                </div>

                <!-- Address -->
                <div class="d-flex align-center text-body-2 text-medium-emphasis mb-2">
                  <VIcon size="16" class="me-1">
                    ri-map-pin-line
                  </VIcon>
                  <span class="text-truncate">{{ business.address }}</span>
                </div>

                <!-- Rating -->
                <div class="d-flex align-center mb-2">
                  <VRating
                    :model-value="business.averageRating"
                    half-increments
                    readonly
                    density="compact"
                    size="18"
                    color="warning"
                    active-color="warning"
                  />
                  <span class="text-body-2 font-weight-medium ms-1">
                    {{ business.averageRating?.toFixed(1) || '0.0' }}
                  </span>
                  <span class="text-body-2 text-medium-emphasis ms-1">
                    ({{ business.reviewCount || 0 }})
                  </span>
                </div>

                <!-- Today Hours -->
                <div
                  v-if="business.todayHours"
                  class="d-flex align-center text-body-2 text-medium-emphasis mb-3"
                >
                  <VIcon size="16" class="me-1">
                    ri-time-line
                  </VIcon>
                  오늘 {{ business.todayHours }}
                </div>

                <!-- Tags -->
                <div
                  v-if="business.tags && business.tags.length > 0"
                  class="d-flex flex-wrap ga-1"
                >
                  <VChip
                    v-for="tag in business.tags"
                    :key="tag"
                    size="x-small"
                    variant="outlined"
                    color="secondary"
                  >
                    {{ tag }}
                  </VChip>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="d-flex justify-center mt-8"
        >
          <VPagination
            v-model="page"
            :length="totalPages"
            :total-visible="7"
            rounded="circle"
            active-color="primary"
          />
        </div>
      </VContainer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.booking-search-page {
  min-block-size: 100vh;
  padding-block-end: 56px; // VBottomNavigation height

  @media (min-width: 600px) {
    padding-block-end: 0;
  }
}

.hero-section {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(99, 102, 241, 0.8) 100%);
}

.business-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>

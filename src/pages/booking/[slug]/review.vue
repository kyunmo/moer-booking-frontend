<route lang="yaml">
meta:
  layout: public
  public: true
  requiresCustomerAuth: true
  title: 리뷰 작성 - YEMO
</route>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import customerApi from '@/api/customer'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatTimeRange } from '@/utils/dateFormat'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const customerAuthStore = useCustomerAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

const slug = computed(() => route.params.slug)
const isLoggedIn = computed(() => customerAuthStore.isAuthenticated)

// Form refs
const formRef = ref(null)
const valid = ref(false)
const submitLoading = ref(false)
const submitted = ref(false)

// Form data
const reservationNumber = ref('')
const rating = ref(0)
const content = ref('')
const staffId = ref(null)

// Reservation selection (for logged-in users)
const myReservations = ref([])
const reservationsLoading = ref(false)
const selectedReservationNumber = ref(null)

// Build select items from fetched reservations
const reservationSelectItems = computed(() =>
  myReservations.value.map(r => {
    const services = (r.services || [])
      .map(s => (typeof s === 'string' ? s : s.name))
      .join(', ')

    const dateStr = r.reservationDate ? formatDateShort(r.reservationDate) : ''
    const timeStr = formatTimeRange(r.startTime, r.endTime)
    const label = [dateStr, timeStr, services].filter(Boolean).join(' | ')

    return {
      title: label || r.reservationNumber,
      subtitle: r.reservationNumber,
      value: r.reservationNumber,
    }
  }),
)

// Sync selected reservation to reservationNumber
watch(selectedReservationNumber, val => {
  if (val) {
    reservationNumber.value = val
  }
})

// Business staff list
const staffs = computed(() => bookingStore.business?.staffs || [])
const staffItems = computed(() =>
  staffs.value.map(s => ({
    title: s.name,
    value: s.id,
  })),
)

// Validation rules
const rules = {
  required: v => !!v || '필수 입력 항목입니다',
  rating: v => v > 0 || '별점을 선택해주세요',
}

// Error code to message mapping
const errorMessages = {
  RV001: '예약 정보가 일치하지 않습니다',
  RV002: '완료된 예약만 리뷰를 작성할 수 있습니다',
  RV003: '이미 리뷰가 작성된 예약입니다',
  CP004: '본인의 예약에 대해서만 리뷰를 작성할 수 있습니다',
}

// Fetch completed, un-reviewed reservations for the logged-in customer
async function fetchMyReservations() {
  if (!isLoggedIn.value) return

  reservationsLoading.value = true
  try {
    const result = await customerApi.getMyReservations({
      status: 'COMPLETED',
      size: 100,
    })

    const data = result?.data ?? result

    let list = []
    if (Array.isArray(data)) {
      list = data
    }
    else if (data) {
      list = data.content || data.items || []
    }

    // Filter: only COMPLETED reservations without a review, belonging to this business
    // slug.value can be either a slug string or a numeric ID
    const slugVal = slug.value
    const isNumericSlug = /^\d+$/.test(slugVal)

    myReservations.value = list.filter(r => {
      if (r.status !== 'COMPLETED' || r.hasReview) return false

      // Match by slug or by businessId when slug param is numeric
      if (r.businessSlug === slugVal) return true
      if (isNumericSlug && String(r.businessId) === slugVal) return true

      return false
    })
  }
  catch (error) {
    console.error('[Review] Failed to fetch reservations:', error)
    // Silently fail - user can still type manually
  }
  finally {
    reservationsLoading.value = false
  }
}

// Short date formatter for select items
function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

onMounted(async () => {
  // 프로필이 없으면 조회
  if (!customerAuthStore.customer) {
    try {
      await customerAuthStore.fetchProfile()
    }
    catch {
      // 프로필 조회 실패 시 무시
    }
  }

  // URL 파라미터에서 예약번호 자동 채우기
  if (route.query.reservationNumber) {
    reservationNumber.value = route.query.reservationNumber
    selectedReservationNumber.value = route.query.reservationNumber
  }

  // 매장 정보 조회 (스태프 목록용)
  if (slug.value && !bookingStore.business) {
    try {
      await bookingStore.fetchBusinessDetail(slug.value)
    }
    catch {
      // 매장 정보 조회 실패 시 무시
    }
  }

  // 로그인된 고객이면 예약 목록 가져오기
  await fetchMyReservations()
})

// Submit review
async function handleSubmit() {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  if (rating.value <= 0) {
    showError('별점을 선택해주세요')

    return
  }

  submitLoading.value = true

  try {
    await customerApi.createReview(slug.value, {
      reservationNumber: reservationNumber.value.trim(),
      rating: rating.value,
      content: content.value.trim() || null,
      staffId: staffId.value || null,
    })

    submitted.value = true
    showSuccess('리뷰가 등록되었습니다')
  }
  catch (error) {
    const message = errorMessages[error?.code] || error?.message || '리뷰 등록에 실패했습니다'
    showError(message)
  }
  finally {
    submitLoading.value = false
  }
}

// Navigate back to business page
function goToBusinessPage() {
  router.push(`/booking/${slug.value}`)
}
</script>

<template>
  <div class="review-page py-8 py-md-12">
    <VContainer style="max-inline-size: 600px;">
          <!-- Success Screen -->
          <template v-if="submitted">
            <VCard
              rounded="lg"
              elevation="2"
            >
              <VCardText class="text-center pa-8 pa-md-12">
                <VIcon
                  icon="ri-check-double-line"
                  size="72"
                  color="success"
                  class="mb-4"
                />

                <h2 class="text-h5 font-weight-bold mb-3">
                  리뷰가 등록되었습니다!
                </h2>

                <p class="text-body-1 text-medium-emphasis mb-6">
                  소중한 리뷰를 남겨주셔서 감사합니다.
                </p>

                <VBtn
                  color="primary"
                  size="large"
                  @click="goToBusinessPage"
                >
                  <VIcon start>
                    ri-store-2-line
                  </VIcon>
                  매장 페이지로 이동
                </VBtn>
              </VCardText>
            </VCard>
          </template>

          <!-- Review Form -->
          <template v-else>
            <!-- Page Title -->
            <div class="text-center mb-8">
              <VIcon
                icon="ri-star-smile-line"
                size="48"
                color="amber"
                class="mb-3"
              />
              <h1 class="text-h4 font-weight-bold mb-2">
                리뷰 작성
              </h1>
              <p class="text-body-1 text-medium-emphasis">
                서비스 이용은 어떠셨나요? 소중한 후기를 남겨주세요
              </p>
            </div>

            <VCard
              rounded="lg"
              elevation="2"
            >
              <VCardText class="pa-6">
                <VForm
                  ref="formRef"
                  v-model="valid"
                  @submit.prevent="handleSubmit"
                >
                  <!-- Customer Info Section -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      <VIcon
                        icon="ri-user-line"
                        size="20"
                        class="me-1"
                      />
                      로그인 정보
                    </h3>

                    <VAlert
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                    >
                      로그인 계정으로 본인 확인이 됩니다
                    </VAlert>

                    <VRow dense>
                      <VCol
                        cols="12"
                        sm="6"
                      >
                        <VTextField
                          :model-value="customerAuthStore.customerName"
                          label="이름"
                          prepend-inner-icon="ri-user-3-line"
                          variant="outlined"
                          density="comfortable"
                          readonly
                          disabled
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        sm="6"
                      >
                        <VTextField
                          :model-value="customerAuthStore.customerEmail"
                          label="이메일"
                          prepend-inner-icon="ri-mail-line"
                          variant="outlined"
                          density="comfortable"
                          readonly
                          disabled
                        />
                      </VCol>
                    </VRow>
                  </div>

                  <VDivider class="mb-6" />

                  <!-- Reservation Number Section -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      <VIcon
                        icon="ri-shield-check-line"
                        size="20"
                        class="me-1"
                      />
                      예약 확인
                    </h3>

                    <!-- Logged-in: Reservation Select -->
                    <template v-if="isLoggedIn">
                      <VSelect
                        v-if="reservationSelectItems.length > 0"
                        v-model="selectedReservationNumber"
                        :items="reservationSelectItems"
                        :loading="reservationsLoading"
                        label="예약을 선택해주세요"
                        prepend-inner-icon="ri-calendar-check-line"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        no-data-text="리뷰 작성 가능한 예약이 없습니다"
                      >
                        <template #item="{ props: itemProps, item }">
                          <VListItem v-bind="itemProps">
                            <template #subtitle>
                              <span class="text-caption">
                                {{ item.raw.subtitle }}
                              </span>
                            </template>
                          </VListItem>
                        </template>
                      </VSelect>

                      <!-- No eligible reservations message -->
                      <VAlert
                        v-else-if="!reservationsLoading"
                        type="info"
                        variant="tonal"
                        density="compact"
                        class="mb-4"
                      >
                        리뷰 작성 가능한 예약이 없습니다. 예약번호를 직접 입력해주세요.
                      </VAlert>

                      <!-- Loading state -->
                      <div
                        v-else
                        class="d-flex align-center justify-center pa-4"
                      >
                        <VProgressCircular
                          indeterminate
                          size="24"
                          width="2"
                          color="primary"
                          class="me-3"
                        />
                        <span class="text-body-2 text-medium-emphasis">예약 목록을 불러오는 중...</span>
                      </div>

                      <!-- Fallback manual input when no eligible reservations -->
                      <VTextField
                        v-if="reservationSelectItems.length === 0 && !reservationsLoading"
                        v-model="reservationNumber"
                        label="예약번호"
                        placeholder="260220-A3B9"
                        prepend-inner-icon="ri-hashtag"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                      />
                    </template>

                    <!-- Not logged-in: Manual Input -->
                    <VTextField
                      v-else
                      v-model="reservationNumber"
                      label="예약번호"
                      placeholder="260220-A3B9"
                      prepend-inner-icon="ri-hashtag"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                    />
                  </div>

                  <VDivider class="mb-6" />

                  <!-- Rating Section -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      <VIcon
                        icon="ri-star-line"
                        size="20"
                        class="me-1"
                      />
                      별점
                    </h3>

                    <div class="text-center mb-2">
                      <VRating
                        v-model="rating"
                        :size="40"
                        color="grey-lighten-1"
                        active-color="amber"
                        hover
                      />
                      <p
                        v-if="rating > 0"
                        class="text-body-2 text-medium-emphasis mt-2"
                      >
                        {{ ['', '별로예요', '그저 그래요', '보통이에요', '좋아요', '최고예요'][rating] }}
                      </p>
                      <p
                        v-else
                        class="text-body-2 text-medium-emphasis mt-2"
                      >
                        별점을 선택해주세요
                      </p>
                    </div>
                  </div>

                  <VDivider class="mb-6" />

                  <!-- Review Content Section -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      <VIcon
                        icon="ri-edit-line"
                        size="20"
                        class="me-1"
                      />
                      리뷰 내용
                    </h3>

                    <VTextarea
                      v-model="content"
                      label="리뷰 내용"
                      placeholder="서비스 이용 후기를 자유롭게 작성해주세요"
                      variant="outlined"
                      rows="4"
                      counter="500"
                      maxlength="500"
                      hide-details="auto"
                    />
                  </div>

                  <!-- Staff Selection -->
                  <div
                    v-if="staffItems.length > 0"
                    class="mb-6"
                  >
                    <VSelect
                      v-model="staffId"
                      :items="staffItems"
                      label="담당 스태프 (선택)"
                      prepend-inner-icon="ri-user-line"
                      variant="outlined"
                      density="comfortable"
                      clearable
                      hide-details="auto"
                    />
                  </div>

                  <!-- Submit Button -->
                  <VBtn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="submitLoading"
                    :disabled="!valid || rating <= 0"
                  >
                    <VIcon start>
                      ri-send-plane-line
                    </VIcon>
                    리뷰 등록
                  </VBtn>
                </VForm>
              </VCardText>
            </VCard>
          </template>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.review-page {
  min-block-size: 80vh;
  padding-block-end: 56px; // VBottomNavigation height

  @media (min-width: 600px) {
    padding-block-end: 0;
  }
}
</style>

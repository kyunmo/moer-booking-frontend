<route lang="yaml">
meta:
  layout: public
  public: true
  requiresCustomerAuth: true
  title: 내 리뷰 - 모에르(MOER)
</route>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import customerApi from '@/api/customer'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const customerAuthStore = useCustomerAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

const reviews = ref([])
const loading = ref(false)

// Edit dialog
const isEditOpen = ref(false)
const editingReview = ref(null)
const editForm = ref({ rating: 5, content: '' })
const editLoading = ref(false)

// Delete dialog
const isDeleteOpen = ref(false)
const deletingReview = ref(null)
const deleteLoading = ref(false)

// Image dialog
const isImageOpen = ref(false)
const imageReview = ref(null)
const imageUploading = ref(false)
const imageFileInput = ref(null)

async function fetchReviews() {
  loading.value = true
  try {
    const result = await customerApi.getMyReviews()
    const data = result?.data ?? result

    if (Array.isArray(data)) {
      reviews.value = data
    }
    else if (data) {
      reviews.value = data.content || data.items || []
    }
    else {
      reviews.value = []
    }
  }
  catch (error) {
    if (error.status === 401) {
      showError('로그인이 필요합니다')
      router.replace('/booking/login?redirect=/booking/my-reviews')

      return
    }
    showError(error.message || '리뷰 목록을 불러오지 못했습니다')
    reviews.value = []
  }
  finally {
    loading.value = false
  }
}

// Edit
function openEdit(review) {
  editingReview.value = review
  editForm.value = {
    rating: review.rating,
    content: review.content,
  }
  isEditOpen.value = true
}

async function submitEdit() {
  if (!editingReview.value) return
  editLoading.value = true
  try {
    const result = await customerApi.updateReview(editingReview.value.id, editForm.value)
    const data = result?.data ?? result
    const idx = reviews.value.findIndex(r => r.id === editingReview.value.id)

    if (idx !== -1) {
      reviews.value[idx] = { ...reviews.value[idx], ...data }
    }
    isEditOpen.value = false
    showSuccess('리뷰가 수정되었습니다')
  }
  catch (err) {
    const code = err.code

    if (code === 'RI003') showError('본인의 리뷰만 수정할 수 있습니다')
    else if (code === 'RV006') showError('이미 삭제된 리뷰입니다')
    else showError(err.message || '리뷰 수정에 실패했습니다')
  }
  finally {
    editLoading.value = false
  }
}

// Delete
function openDelete(review) {
  deletingReview.value = review
  isDeleteOpen.value = true
}

async function submitDelete() {
  if (!deletingReview.value) return
  deleteLoading.value = true
  try {
    await customerApi.deleteReview(deletingReview.value.id)
    reviews.value = reviews.value.filter(r => r.id !== deletingReview.value.id)
    isDeleteOpen.value = false
    showSuccess('리뷰가 삭제되었습니다')
  }
  catch (err) {
    const code = err.code

    if (code === 'RV006') showError('이미 삭제된 리뷰입니다')
    else showError(err.message || '리뷰 삭제에 실패했습니다')
  }
  finally {
    deleteLoading.value = false
  }
}

// Images
function openImageManager(review) {
  imageReview.value = review
  isImageOpen.value = true
}

function triggerImageUpload() {
  imageFileInput.value?.click()
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file || !imageReview.value) return

  // Validate file size
  const maxSize = 5 * 1024 * 1024

  if (file.size > maxSize) {
    showError('이미지 크기는 5MB 이하만 가능합니다')

    return
  }

  // Validate file type
  const allowed = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowed.includes(file.type)) {
    showError('JPG, PNG, WebP 형식만 지원합니다')

    return
  }

  imageUploading.value = true
  try {
    const result = await customerApi.uploadReviewImage(imageReview.value.id, file)
    const data = result?.data ?? result

    if (!imageReview.value.images) imageReview.value.images = []
    imageReview.value.images.push(data)
    showSuccess('이미지가 업로드되었습니다')
  }
  catch (err) {
    if (err.code === 'RI002') showError('리뷰당 최대 5개의 이미지만 등록할 수 있습니다')
    else showError(err.message || '이미지 업로드에 실패했습니다')
  }
  finally {
    imageUploading.value = false

    // Reset file input for re-upload of same file
    event.target.value = ''
  }
}

async function removeImage(image) {
  if (!imageReview.value) return
  try {
    await customerApi.deleteReviewImage(imageReview.value.id, image.id)
    imageReview.value.images = imageReview.value.images.filter(i => i.id !== image.id)
    showSuccess('이미지가 삭제되었습니다')
  }
  catch (err) {
    if (err.code === 'RI001') showError('리뷰 이미지를 찾을 수 없습니다')
    else showError(err.message || '이미지 삭제에 실패했습니다')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'

  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  if (!customerAuthStore.isAuthenticated) {
    router.push('/booking/login?redirect=/booking/my-reviews')

    return
  }
  fetchReviews()
})
</script>

<template>
  <div class="my-reviews-page py-8 py-md-12">
    <VContainer style="max-inline-size: 800px;">
      <!-- Page Title -->
      <div class="text-center mb-8">
        <VIcon
          icon="ri-chat-3-line"
          size="48"
          color="primary"
          class="mb-3"
        />
        <h1 class="text-h4 font-weight-bold mb-2">
          내 리뷰
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          작성한 리뷰를 확인하고 관리하세요
        </p>
      </div>

      <!-- Loading State -->
      <template v-if="loading">
        <VCard
          v-for="n in 3"
          :key="n"
          class="mb-4"
          rounded="lg"
          variant="outlined"
        >
          <VCardText>
            <VSkeletonLoader type="list-item-three-line" />
          </VCardText>
        </VCard>
      </template>

      <!-- Empty State -->
      <div
        v-else-if="reviews.length === 0"
        class="text-center py-16"
      >
        <VIcon
          icon="ri-chat-3-line"
          size="80"
          color="grey-lighten-1"
          class="mb-4"
        />
        <h3 class="text-h6 text-medium-emphasis mb-2">
          작성한 리뷰가 없습니다
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-6">
          예약 완료 후 리뷰를 작성해보세요
        </p>
        <VBtn
          color="primary"
          variant="outlined"
          @click="router.push('/booking/my-reservations')"
        >
          <VIcon start>
            ri-calendar-check-line
          </VIcon>
          내 예약 보기
        </VBtn>
      </div>

      <!-- Review List -->
      <template v-else>
        <VCard
          v-for="review in reviews"
          :key="review.id"
          class="review-card mb-4"
          rounded="lg"
          variant="outlined"
        >
          <VCardText class="pa-4 pa-sm-5">
            <!-- Header: Service + Menu -->
            <div class="d-flex align-start justify-space-between mb-3">
              <div style="min-inline-size: 0;">
                <div class="text-subtitle-1 font-weight-bold text-truncate">
                  {{ review.serviceName || '서비스' }}
                </div>
                <div
                  v-if="review.staffName"
                  class="text-body-2 text-medium-emphasis"
                >
                  담당: {{ review.staffName }}
                </div>
              </div>

              <VMenu>
                <template #activator="{ props }">
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    v-bind="props"
                  >
                    <VIcon>ri-more-2-line</VIcon>
                  </VBtn>
                </template>
                <VList density="compact">
                  <VListItem
                    prepend-icon="ri-edit-line"
                    title="수정"
                    @click="openEdit(review)"
                  />
                  <VListItem
                    prepend-icon="ri-image-add-line"
                    title="사진 관리"
                    @click="openImageManager(review)"
                  />
                  <VListItem
                    prepend-icon="ri-delete-bin-line"
                    title="삭제"
                    class="text-error"
                    @click="openDelete(review)"
                  />
                </VList>
              </VMenu>
            </div>

            <!-- Rating -->
            <VRating
              :model-value="review.rating"
              readonly
              density="compact"
              size="20"
              color="warning"
              active-color="warning"
              class="mb-2"
            />

            <!-- Content -->
            <p class="text-body-1 mb-3">
              {{ review.content }}
            </p>

            <!-- Images -->
            <div
              v-if="review.images && review.images.length > 0"
              class="d-flex ga-2 mb-3 overflow-x-auto"
            >
              <VImg
                v-for="img in review.images"
                :key="img.id"
                :src="img.thumbnailUrl || img.imageUrl"
                width="80"
                height="80"
                cover
                rounded="lg"
                class="flex-shrink-0 review-image"
              />
            </div>

            <!-- Footer -->
            <div class="d-flex align-center justify-space-between text-body-2 text-medium-emphasis">
              <span>{{ formatDate(review.createdAt) }}</span>
              <span
                v-if="review.updatedAt && review.updatedAt !== review.createdAt"
                class="text-caption"
              >
                (수정됨)
              </span>
            </div>
          </VCardText>
        </VCard>
      </template>
    </VContainer>

    <!-- Edit Dialog -->
    <VDialog
      v-model="isEditOpen"
      max-width="500"
      persistent
    >
      <VCard rounded="lg">
        <VCardTitle class="d-flex align-center pa-5 pb-3">
          <VIcon
            icon="ri-edit-line"
            class="me-2"
          />
          리뷰 수정
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">
              평점
            </div>
            <VRating
              v-model="editForm.rating"
              density="compact"
              size="32"
              color="warning"
              active-color="warning"
            />
          </div>

          <VTextarea
            v-model="editForm.content"
            label="리뷰 내용"
            variant="outlined"
            rows="4"
            counter="2000"
            :rules="[v => !v || v.length <= 2000 || '최대 2000자']"
          />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="isEditOpen = false"
          >
            취소
          </VBtn>
          <VBtn
            color="primary"
            :loading="editLoading"
            @click="submitEdit"
          >
            수정
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog
      v-model="isDeleteOpen"
      max-width="440"
    >
      <VCard rounded="lg">
        <VCardTitle class="text-h6 pa-6 pb-2">
          리뷰를 삭제하시겠습니까?
        </VCardTitle>

        <VCardText class="pa-6 pt-3">
          <p class="text-body-2 text-medium-emphasis">
            삭제된 리뷰는 복구할 수 없습니다.
          </p>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="isDeleteOpen = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            :loading="deleteLoading"
            @click="submitDelete"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Image Manager Dialog -->
    <VDialog
      v-model="isImageOpen"
      max-width="500"
      persistent
    >
      <VCard rounded="lg">
        <VCardTitle class="d-flex align-center pa-5 pb-3">
          <VIcon
            icon="ri-image-line"
            class="me-2"
          />
          사진 관리
          <VSpacer />
          <VChip
            size="small"
            variant="tonal"
          >
            {{ imageReview?.images?.length || 0 }}/5
          </VChip>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <!-- Current images -->
          <div
            v-if="imageReview?.images?.length > 0"
            class="d-flex flex-wrap ga-2 mb-4"
          >
            <div
              v-for="img in imageReview.images"
              :key="img.id"
              class="position-relative"
            >
              <VImg
                :src="img.thumbnailUrl || img.imageUrl"
                width="100"
                height="100"
                cover
                rounded="lg"
              />
              <VBtn
                icon
                size="x-small"
                color="error"
                class="position-absolute"
                style="inset-block-start: -8px; inset-inline-end: -8px;"
                @click="removeImage(img)"
              >
                <VIcon size="14">
                  ri-close-line
                </VIcon>
              </VBtn>
            </div>
          </div>

          <div
            v-else
            class="text-center py-4 text-medium-emphasis"
          >
            <VIcon
              icon="ri-image-add-line"
              size="40"
              class="mb-2"
            />
            <p class="text-body-2">
              등록된 사진이 없습니다
            </p>
          </div>

          <!-- Upload Button -->
          <VBtn
            v-if="(imageReview?.images?.length || 0) < 5"
            color="primary"
            variant="outlined"
            block
            :loading="imageUploading"
            @click="triggerImageUpload"
          >
            <VIcon start>
              ri-image-add-line
            </VIcon>
            사진 추가 (JPG, PNG, WebP / 5MB 이하)
          </VBtn>

          <input
            ref="imageFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            @change="handleImageUpload"
          >
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="isImageOpen = false"
          >
            닫기
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss" scoped>
.my-reviews-page {
  min-block-size: 80vh;
  padding-block-end: 56px; // VBottomNavigation height

  @media (min-width: 600px) {
    padding-block-end: 0;
  }
}

.review-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.review-image {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>

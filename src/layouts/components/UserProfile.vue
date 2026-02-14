<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// 사용자 정보
const userName = computed(() => authStore.userName || '사용자')
const userEmail = computed(() => authStore.userEmail || '')
const userRole = computed(() => {
  const role = authStore.userRole
  if (role === 'OWNER') return '관리자'
  if (role === 'STAFF') return '스태프'
  return '사용자'
})

// 사용자 이름의 첫 글자
const userInitial = computed(() => {
  const name = userName.value
  return name ? name.charAt(0).toUpperCase() : 'U'
})

// 프로필 이미지 (현재는 없으므로 항상 null)
const userAvatar = computed(() => authStore.user?.avatar || null)

const userProfileList = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-user-line',
    title: '프로필',
    to: '/profile',
  },
  {
    type: 'navItem',
    icon: 'ri-settings-4-line',
    title: '매장 설정',
    to: '/shop-admin/business-settings',
  },
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-question-line',
    title: '고객지원',
    to: '/support',
  },
]

// 로그아웃
async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
      :color="userAvatar ? undefined : 'primary'"
    >
      <!-- 프로필 이미지가 있는 경우 -->
      <VImg v-if="userAvatar" :src="userAvatar" />

      <!-- 프로필 이미지가 없는 경우: 이름 첫 글자 표시 -->
      <span v-else class="text-base font-weight-medium">
        {{ userInitial }}
      </span>

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <!-- 사용자 정보 -->
          <VListItem class="px-4">
            <div class="d-flex gap-x-2 align-center">
              <VAvatar :color="userAvatar ? undefined : 'primary'">
                <VImg v-if="userAvatar" :src="userAvatar" />
                <span v-else class="text-base font-weight-medium">
                  {{ userInitial }}
                </span>
              </VAvatar>

              <div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  {{ userName }}
                </div>
                <div class="text-caption text-disabled">
                  {{ userRole }}
                </div>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <!-- 메뉴 항목 -->
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                class="px-4"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.chipsProps"
                  #append
                >
                  <VChip
                    v-bind="item.chipsProps"
                    variant="elevated"
                  />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-1"
              />
            </template>

            <!-- 로그아웃 버튼 -->
            <VListItem class="px-4">
              <VBtn
                block
                color="error"
                size="small"
                append-icon="ri-logout-box-r-line"
                @click="handleLogout"
              >
                로그아웃
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>

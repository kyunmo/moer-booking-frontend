<template>
  <div>
    <VRow>
      <!-- 오늘 예약 수 -->
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar
              color="primary"
              variant="tonal"
              size="44"
              class="me-4"
            >
              <VIcon
                icon="ri-calendar-check-line"
                size="26"
              />
            </VAvatar>
            
            <div>
              <p class="text-xs text-disabled mb-1">
                오늘 예약
              </p>
              <h5 class="text-h5 font-weight-medium">
                12건
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 이번 달 예약 수 -->
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar
              color="success"
              variant="tonal"
              size="44"
              class="me-4"
            >
              <VIcon
                icon="ri-bar-chart-line"
                size="26"
              />
            </VAvatar>
            
            <div>
              <p class="text-xs text-disabled mb-1">
                이번 달
              </p>
              <h5 class="text-h5 font-weight-medium">
                245건
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 신규 고객 -->
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar
              color="warning"
              variant="tonal"
              size="44"
              class="me-4"
            >
              <VIcon
                icon="ri-user-add-line"
                size="26"
              />
            </VAvatar>
            
            <div>
              <p class="text-xs text-disabled mb-1">
                신규 고객
              </p>
              <h5 class="text-h5 font-weight-medium">
                8명
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 이번 달 매출 -->
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar
              color="info"
              variant="tonal"
              size="44"
              class="me-4"
            >
              <VIcon
                icon="ri-money-dollar-circle-line"
                size="26"
              />
            </VAvatar>
            
            <div>
              <p class="text-xs text-disabled mb-1">
                이번 달 매출
              </p>
              <h5 class="text-h5 font-weight-medium">
                8,450,000원
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 오늘 예약 목록 -->
    <VRow class="mt-4">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-calendar-event-line" class="me-2" />
            오늘의 예약
          </VCardTitle>
          
          <VCardText>
            <VAlert
              color="info"
              variant="tonal"
              class="mb-0"
            >
              <VIcon icon="ri-information-line" class="me-2" />
              대시보드는 나중에 실제 데이터를 연동하여 구현됩니다.
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
// TODO: 실제 데이터 연동
</script>

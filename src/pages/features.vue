<route lang="yaml">
meta:
  layout: public
  public: true
</route>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 기능 카테고리
const featureCategories = [
  {
    id: 'reservation',
    icon: 'ri-calendar-line',
    color: 'primary',
    title: '예약 관리',
    subtitle: '모든 예약을 한곳에서',
    features: [
      {
        title: '예약 캘린더',
        icon: 'ri-calendar-check-line',
        description: '일/주/월 뷰로 자유롭게 전환하고, 디자이너별 색상으로 구분. 드래그로 간편하게 시간 조정',
        highlights: ['일/주/월 뷰', '드래그 편집', '색상 구분'],
      },
      {
        title: '24시간 자동 예약',
        icon: 'ri-time-line',
        description: '밤에도 새벽에도 고객이 직접 예약. 관리자는 아침에 확인만 하면 됩니다',
        highlights: ['24시간 접수', '모바일 최적화', '즉시 알림'],
      },
      {
        title: '시간 충돌 방지',
        icon: 'ri-shield-check-line',
        description: '예약 겹침 걱정 Zero. 시스템이 자동으로 체크하고 휴무 시간도 자동 제외',
        highlights: ['자동 체크', '시간 계산', '휴무 반영'],
      },
      {
        title: '예약 상태 관리',
        icon: 'ri-list-check',
        description: '대기중/확정/완료/취소 상태별 분류. 원클릭 승인과 예약별 메모 기능',
        highlights: ['상태 분류', '원클릭 승인', '메모 기능'],
      },
    ],
  },
  {
    id: 'kakao',
    icon: 'ri-message-3-line',
    color: 'success',
    title: '카카오톡 자동 알림',
    subtitle: '고객과의 소통, 이제 자동으로',
    features: [
      {
        title: '예약 확정 알림',
        icon: 'ri-check-double-line',
        description: '예약 승인 시 1초 안에 고객 카톡 도착. 날짜, 시간, 시술 정보 자동 발송',
        highlights: ['즉시 발송', '자동 작성', '친절한 문구'],
      },
      {
        title: '하루 전 리마인더',
        icon: 'ri-alarm-line',
        description: '예약 하루 전 자동 발송으로 노쇼율 80% 감소. 발송 시간 설정 가능',
        highlights: ['자동 발송', '노쇼 80% 감소', '시간 설정'],
      },
      {
        title: '예약 취소 알림',
        icon: 'ri-close-circle-line',
        description: '취소 시에도 친절하게 안내. 재예약 유도로 브랜드 이미지 향상',
        highlights: ['친절한 안내', '재예약 유도', '브랜드 UP'],
      },
      {
        title: '재방문 알림',
        icon: 'ri-repeat-line',
        badge: 'PRO',
        description: '시술별 맞춤 주기로 자동 발송. 펌 3개월, 염색 2개월 후 재방문 추천',
        highlights: ['시술별 주기', '재방문율 30% 증가', '단골 확보'],
      },
    ],
  },
  {
    id: 'customer',
    icon: 'ri-user-heart-line',
    color: 'info',
    title: '고객 관리',
    subtitle: '단골 고객, 이제 한눈에',
    features: [
      {
        title: '고객 자동 등록',
        icon: 'ri-user-add-line',
        description: '예약 시 자동 생성되고 중복 자동 체크. 빠른 검색으로 1초 안에 찾기',
        highlights: ['자동 등록', '중복 체크', '빠른 검색'],
      },
      {
        title: '방문 이력 자동 기록',
        icon: 'ri-history-line',
        description: '방문 날짜, 시술 내역, 결제 금액 자동 저장. 총 방문 횟수와 금액 자동 집계',
        highlights: ['자동 저장', '자동 집계', '맞춤 서비스'],
      },
      {
        title: '고객 태그',
        icon: 'ri-price-tag-3-line',
        description: 'VIP, 단골, 알러지 등 자유롭게 태그. 색상으로 구분하고 필터링 가능',
        highlights: ['자유 태그', '색상 구분', '필터링'],
      },
      {
        title: '고객 메모',
        icon: 'ri-sticky-note-line',
        description: '특별 요청이나 주의사항 기록. 관리자만 볼 수 있는 비공개 메모',
        highlights: ['특별 요청', '비공개', '절대 안 까먹음'],
      },
    ],
  },
  {
    id: 'statistics',
    icon: 'ri-line-chart-line',
    color: 'warning',
    title: '통계 & 대시보드',
    subtitle: '데이터로 보는 우리 가게',
    features: [
      {
        title: '실시간 매출 현황',
        icon: 'ri-money-dollar-circle-line',
        description: '오늘/주간/월간 매출 실시간 확인. 전월 대비 증감률 자동 계산',
        highlights: ['실시간 업데이트', '증감률', '한눈에 파악'],
      },
      {
        title: '예약 건수 그래프',
        icon: 'ri-bar-chart-line',
        description: '일별/주별/월별 그래프로 바쁜 요일과 한가한 시간대 파악',
        highlights: ['막대 그래프', '패턴 분석', '경영 인사이트'],
      },
      {
        title: '인기 시술 순위',
        icon: 'ri-trophy-line',
        description: 'TOP 5 시술 메뉴로 인기 메뉴 홍보 강화. 재고 관리와 신메뉴 개발 참고',
        highlights: ['TOP 5', '트렌드 파악', '매출 UP'],
      },
      {
        title: '디자이너별 성과',
        icon: 'ri-team-line',
        badge: 'PRO',
        description: '디자이너별 예약 건수, 매출, 재방문율 확인. 인센티브 계산 자동',
        highlights: ['성과 분석', '인센티브', '투명한 평가'],
      },
    ],
  },
  {
    id: 'settings',
    icon: 'ri-settings-3-line',
    color: 'secondary',
    title: '매장 설정',
    subtitle: '우리 가게에 딱 맞게',
    features: [
      {
        title: '영업시간 설정',
        icon: 'ri-time-line',
        description: '요일별 영업시간과 점심시간 설정. 특별 휴무도 간편하게 등록',
        highlights: ['요일별 설정', '점심시간', '특별 휴무'],
      },
      {
        title: '예약 간격 설정',
        icon: 'ri-timer-line',
        description: '30분/1시간 단위 선택. 예약 간 정리 시간과 자동 확정 설정',
        highlights: ['시간 단위', '정리 시간', '자동 확정'],
      },
      {
        title: '디자이너 관리',
        icon: 'ri-user-settings-line',
        description: '디자이너 추가/삭제와 개인 일정 관리. 포트폴리오 업로드로 신규 고객 유치',
        highlights: ['프로필 관리', '개인 일정', '포트폴리오'],
      },
      {
        title: '시술 메뉴 관리',
        icon: 'ri-file-list-3-line',
        description: '메뉴 추가/수정이 클릭 몇 번으로 완료. 메뉴 조합과 할인가 설정',
        highlights: ['간편 추가', '메뉴 조합', '가격 설정'],
      },
    ],
  },
  {
    id: 'mobile',
    icon: 'ri-smartphone-line',
    color: 'error',
    title: '모바일 최적화',
    subtitle: '어디서든 관리 가능',
    features: [
      {
        title: '관리자 모바일 앱',
        icon: 'ri-admin-line',
        description: '스마트폰으로 예약 확인, 승인/거절, 통계 확인. 외출 중에도 OK',
        highlights: ['모든 기능', '푸시 알림', '어디서든'],
      },
      {
        title: '고객 예약 페이지',
        icon: 'ri-user-smile-line',
        description: '고객도 스마트폰으로 편리하게. 터치 최적화와 빠른 로딩',
        highlights: ['터치 최적화', '직관적 UI', '3초 로딩'],
      },
      {
        title: '반응형 디자인',
        icon: 'ri-layout-line',
        description: 'PC, 태블릿, 스마트폰 모두 최적화. 어떤 기기에서도 완벽한 경험',
        highlights: ['모든 기기', '최적화', '완벽한 경험'],
      },
      {
        title: '오프라인 지원',
        icon: 'ri-wifi-off-line',
        description: '인터넷 연결 없어도 기본 기능 사용. 연결되면 자동 동기화',
        highlights: ['오프라인', '자동 동기화', '안정성'],
      },
    ],
  },
]

function startFreeTrial() {
  router.push('/register')
}
</script>

<template>
  <div class="features-page">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <VContainer>
        <div class="text-center">
          <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">
            moer의 모든 기능을 한눈에
          </h1>
          <p class="text-h6 text-medium-emphasis">
            전화 예약부터 고객 관리까지<br>
            예약 시스템에 필요한 모든 것이 여기 있습니다
          </p>
        </div>
      </VContainer>
    </section>

    <!-- 기능 카테고리 섹션 -->
    <section
      v-for="(category, categoryIndex) in featureCategories"
      :key="category.id"
      :class="['feature-category-section', 'py-16', categoryIndex % 2 === 0 ? 'bg-surface' : '']"
    >
      <VContainer>
        <!-- 카테고리 헤더 -->
        <div class="text-center mb-12">
          <VAvatar
            :color="category.color"
            size="80"
            variant="tonal"
            class="mb-4"
          >
            <VIcon :icon="category.icon" size="40" />
          </VAvatar>
          <h2 class="text-h3 font-weight-bold mb-2">
            {{ category.title }}
          </h2>
          <p class="text-h6 text-medium-emphasis">
            {{ category.subtitle }}
          </p>
        </div>

        <!-- 기능 카드 -->
        <VRow>
          <VCol
            v-for="(feature, featureIndex) in category.features"
            :key="featureIndex"
            cols="12"
            md="6"
          >
            <VCard class="h-100 pa-6" elevation="2">
              <div class="d-flex align-start mb-4">
                <VAvatar
                  :color="category.color"
                  size="56"
                  variant="tonal"
                  class="me-4"
                >
                  <VIcon :icon="feature.icon" size="28" />
                </VAvatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <h3 class="text-h6 font-weight-bold">
                      {{ feature.title }}
                    </h3>
                    <VChip
                      v-if="feature.badge"
                      color="primary"
                      size="small"
                      class="ms-2"
                    >
                      {{ feature.badge }}
                    </VChip>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ feature.description }}
                  </p>
                  <div class="d-flex flex-wrap gap-2">
                    <VChip
                      v-for="(highlight, hIndex) in feature.highlights"
                      :key="hIndex"
                      size="small"
                      variant="tonal"
                      :color="category.color"
                    >
                      {{ highlight }}
                    </VChip>
                  </div>
                </div>
              </div>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- Coming Soon 섹션 -->
    <section class="coming-soon-section py-16 bg-surface">
      <VContainer>
        <div class="text-center mb-12">
          <VChip color="warning" size="large" class="mb-4">
            <VIcon icon="ri-time-line" start />
            Coming Soon
          </VChip>
          <h2 class="text-h3 font-weight-bold mb-2">
            준비 중인 기능
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            더 나은 서비스를 위해 계속 발전하고 있습니다
          </p>
        </div>

        <VRow>
          <VCol
            v-for="(item, index) in [
              { icon: 'ri-mail-line', title: '이메일 자동 발송', description: '예약 확정 이메일과 영수증 자동 발송' },
              { icon: 'ri-file-excel-line', title: '고급 리포트', description: '월별 매출 리포트와 고객 분석, CSV 다운로드' },
              { icon: 'ri-coupon-3-line', title: '쿠폰/이벤트', description: '할인 쿠폰 발행과 이벤트 예약 관리' },
              { icon: 'ri-bank-card-line', title: '온라인 결제', description: '예약금 결제로 노쇼 방지' },
              { icon: 'ri-global-line', title: '다국어 지원', description: '영어, 일본어, 중국어 지원' },
              { icon: 'ri-robot-line', title: 'AI 추천', description: '고객 맞춤 시술 자동 추천' },
            ]"
            :key="index"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard class="text-center pa-6" variant="tonal">
              <VIcon :icon="item.icon" size="48" color="warning" class="mb-3" />
              <h4 class="text-h6 font-weight-bold mb-2">
                {{ item.title }}
              </h4>
              <p class="text-body-2 text-medium-emphasis">
                {{ item.description }}
              </p>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- 최종 CTA -->
    <section class="final-cta-section py-16 bg-primary">
      <VContainer>
        <VRow align="center" justify="center">
          <VCol cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-bold mb-4 text-white">
              모든 기능을 직접 체험해보세요
            </h2>
            <p class="text-h6 mb-8 text-white opacity-90">
              신용카드 등록 불필요 | 언제든 해지 가능
            </p>
            <VBtn
              size="x-large"
              color="white"
              prepend-icon="ri-rocket-line"
              @click="startFreeTrial"
            >
              30일 무료 체험 시작하기
            </VBtn>
          </VCol>
        </VRow>
      </VContainer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.features-page {
  width: 100%;
}

.hero-section {
  padding-block: 80px 60px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.feature-category-section {
  &:nth-child(even) {
    background-color: rgb(var(--v-theme-surface));
  }
}

.coming-soon-section {
  background-color: rgb(var(--v-theme-surface));
}

.final-cta-section {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(99, 102, 241, 0.8) 100%);
}
</style>

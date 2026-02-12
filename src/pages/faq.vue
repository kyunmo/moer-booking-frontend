<route lang="yaml">
meta:
  layout: public
  public: true
</route>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('all')

// FAQ 카테고리
const categories = [
  { id: 'all', title: '전체', icon: 'ri-list-check' },
  { id: 'start', title: '시작하기', icon: 'ri-rocket-line' },
  { id: 'feature', title: '기능', icon: 'ri-function-line' },
  { id: 'pricing', title: '요금 & 결제', icon: 'ri-money-dollar-circle-line' },
  { id: 'support', title: '기술 지원', icon: 'ri-customer-service-line' },
  { id: 'industry', title: '업종별', icon: 'ri-building-line' },
  { id: 'etc', title: '기타', icon: 'ri-question-line' },
]

// FAQ 데이터
const faqs = [
  // 1. 시작하기
  { category: 'start', q: 'moer는 어떤 서비스인가요?', a: 'moer는 소상공인을 위한 예약 관리 시스템입니다.\n\n주요 기능:\n• 24시간 자동 예약 접수\n• 카카오톡 자동 알림\n• 고객 이력 자동 관리\n• 실시간 통계 대시보드\n\n미용실, 필라테스, 스터디카페 등 예약이 필요한 모든 업종에서 사용 가능합니다.' },
  { category: 'start', q: '설치가 어렵나요?', a: '전혀 어렵지 않습니다! 5분이면 시작 가능합니다.\n\n1. 회원가입 (1분)\n2. 매장 정보 입력 (2분)\n3. 디자이너/직원 추가 (1분)\n4. 시술 메뉴 추가 (1분)\n\n복잡한 설정이나 프로그램 설치 불필요. 인터넷만 연결되면 바로 사용 가능합니다.' },
  { category: 'start', q: '무료 체험은 어떻게 신청하나요?', a: '홈페이지에서 바로 신청 가능합니다.\n\n신청 방법:\n1. "무료 체험 시작하기" 버튼 클릭\n2. 이메일, 비밀번호 입력\n3. 매장 정보 간단히 입력\n4. 플랜 선택 (베이직 또는 프로)\n5. 즉시 사용 시작!\n\n신용카드 등록 불필요, 30일 동안 선택한 플랜의 모든 기능 사용 가능.' },
  { category: 'start', q: '무료 체험 후 자동으로 결제되나요?', a: '아니요, 절대 자동 결제되지 않습니다.\n\n안심하세요:\n• 신용카드 등록 불필요\n• 30일 체험 종료 후 자동 결제 없음\n• 유료 전환은 직접 선택하셔야 함\n• 체험 종료 전 이메일 알림\n\n마음에 들지 않으면 아무 조치 없이 30일 후 자동 종료됩니다.' },
  { category: 'start', q: '모바일에서도 되나요?', a: '네, 완벽하게 지원합니다!\n\n관리자 (사장님):\n• 스마트폰 브라우저로 접속\n• 모든 기능 사용 가능\n• 예약 확인/승인/통계 확인\n• 앱 설치 불필요\n\n고객 (예약하는 분):\n• 모바일 최적화된 예약 페이지\n• 카카오톡 링크로 바로 접속\n• 빠른 로딩 (3초 이내)\n\nPC 없어도 스마트폰만 있으면 OK!' },
  { category: 'start', q: '어떤 업종에서 사용할 수 있나요?', a: '예약이 필요한 모든 업종에서 사용 가능합니다.\n\n현재 특화 업종:\n• 미용실/네일샵\n• 필라테스/요가\n• 스터디카페/공방\n• 기타 예약 필요 업종\n\n업종별 맞춤 기능 제공\n예: 미용실 - 포트폴리오, 재방문 알림\n예: 필라테스 - 수강권, 출석 체크' },

  // 2. 기능
  { category: 'feature', q: '카카오톡 알림은 어떻게 설정하나요?', a: '매우 간단합니다!\n\n설정 방법:\n1. 카카오 비즈니스 가입 (무료)\n2. 채널 만들기\n3. moer 대시보드에서 "카카오톡 연결"\n4. 채널 정보 입력\n5. 완료! 즉시 사용 가능\n\n소요 시간: 약 10분\n설정 가이드 영상 제공, 어려우면 1:1 지원해드려요!' },
  { category: 'feature', q: '고객 예약 페이지 주소는 어떻게 되나요?', a: 'yourshop.moer.io 형식으로 자동 생성됩니다.\n\n예시:\n• gangnam-hair.moer.io (강남 헤어)\n• pilates-seocho.moer.io (서초 필라테스)\n• study-cafe-hongdae.moer.io (홍대 스터디카페)\n\n주소 변경 가능, 영문/숫자/하이픈(-) 사용\n\n링크 공유:\n• 카카오톡으로 전송\n• 인스타그램 프로필에 추가\n• QR 코드 생성 (제공)' },
  { category: 'feature', q: '예약이 겹치는 것을 어떻게 방지하나요?', a: '시스템이 자동으로 체크합니다.\n\n시간 충돌 방지:\n• 이미 예약된 시간은 선택 불가\n• 시술 시간 자동 계산\n• 다음 예약 가능 시간 자동 표시\n• 휴무 시간 자동 제외\n\n예시:\n10:00 - "컷" 예약 (60분)\n→ 11:00까지 자동으로 예약 불가\n→ 고객은 11:00 이후 시간만 선택 가능\n\n사람 실수 완벽 차단!' },
  { category: 'feature', q: '고객이 직접 예약을 취소할 수 있나요?', a: '설정에 따라 가능합니다.\n\n옵션 1: 고객 직접 취소 가능\n• 예약 페이지에서 "취소하기" 버튼\n• 취소 시 관리자에게 알림\n• 카카오톡 자동 발송\n• 취소 규정 설정 가능 (예: 3시간 전까지)\n\n옵션 2: 고객 직접 취소 불가\n• 전화로만 취소 가능\n• 노쇼 방지에 효과적\n\n추천: 옵션 1 (고객 편의)' },
  { category: 'feature', q: '포트폴리오는 몇 개까지 올릴 수 있나요?', a: '플랜에 따라 다릅니다.\n\n무료 플랜: 5장\n베이직 플랜: 무제한\n프로 플랜: 무제한 (+ 영상 업로드 가능)\n\n파일 형식:\n• 이미지: JPG, PNG\n• 영상 (프로): MP4\n• 최대 크기: 이미지 5MB, 영상 50MB\n\n포트폴리오 활용:\n• 해시태그로 분류\n• 고객이 포트폴리오 보고 예약\n• 신규 고객 유입 효과' },
  { category: 'feature', q: '여러 매장을 운영하는데 가능한가요?', a: '가능합니다!\n\n방법 1: 매장별 별도 계정\n• 각 매장마다 회원가입\n• 각각 독립 운영\n• 플랜 별도 결제\n\n방법 2: 엔터프라이즈 플랜\n• 10개 매장 이상\n• 통합 대시보드\n• 매장별 할인\n• 본사에서 통합 관리\n• 별도 문의: enterprise@moer.io\n\n프랜차이즈는 엔터프라이즈 추천!' },

  // 3. 요금 & 결제
  { category: 'pricing', q: '요금제는 어떻게 되나요?', a: '3가지 플랜이 있습니다.\n\n무료 플랜: 0원\n• 월 30건 예약\n• 직원 1명\n• 광고 표시\n\n베이직 플랜: 29,000원/월\n• 월 100건 예약\n• 직원 3명\n• 카카오톡 알림\n• 광고 제거 (가장 인기!)\n\n프로 플랜: 79,000원/월\n• 월 500건 예약\n• 직원 10명\n• 재방문 알림\n• 고급 통계\n\n자세한 내용: /pricing' },
  { category: 'pricing', q: 'VAT는 별도인가요?', a: '네, VAT 10%가 별도입니다.\n\n실제 결제 금액:\n• 베이직: 29,000원 + VAT 2,900원 = 31,900원\n• 프로: 79,000원 + VAT 5,900원 = 86,900원\n\n사업자 고객:\n• 세금계산서 발행 가능\n• 이메일로 자동 발송\n• 부가세 공제 가능' },
  { category: 'pricing', q: '결제 수단은 무엇이 있나요?', a: '다양한 결제 수단을 지원합니다.\n\n신용카드: 국내 모든 카드사, 체크카드, 법인카드\n계좌이체: 실시간 이체, CMS 자동이체\n간편결제: 카카오페이, 네이버페이, 토스페이, 페이코\n\n편하신 방법으로 선택하세요!' },
  { category: 'pricing', q: '계약 기간이 있나요?', a: '없습니다!\n\n월간 결제:\n• 언제든 해지 가능\n• 위약금 없음\n• 클릭 한 번으로 해지\n\n연간 결제:\n• 중도 해지 가능\n• 남은 기간 환불\n• 20% 할인 혜택\n\n마음 편하게 시작하세요!' },
  { category: 'pricing', q: '환불 정책은 어떻게 되나요?', a: '공정하게 처리합니다.\n\n30일 무료 체험 기간 내: 100% 환불\n\n유료 전환 후:\n• 사용일 차감 후 일할 계산\n• 예: 29,000원 플랜, 10일 사용 → 19,000원 환불\n• 신청 후 5영업일 이내 처리\n\n연간 결제:\n• 남은 개월 수만큼 환불\n• 예: 12개월 중 3개월 사용 → 9개월치 환불\n\n환불 신청: 대시보드 > 구독 관리' },
  { category: 'pricing', q: '플랜을 중간에 변경할 수 있나요?', a: '네, 언제든 가능합니다!\n\n업그레이드 (무료 → 베이직 → 프로):\n• 즉시 적용\n• 차액만 일할 계산하여 결제\n• 1분 안에 처리 완료\n\n다운그레이드 (프로 → 베이직 → 무료):\n• 다음 결제일부터 적용\n• 현재 기간은 기존 플랜 유지\n• 별도 환불 없음\n\n데이터는 모두 유지, 제한 사항만 변경됨' },
  { category: 'pricing', q: '예약 건수를 초과하면 어떻게 되나요?', a: '차단되지 않고 계속 사용 가능합니다.\n\n무료 플랜 (30건):\n• 30건 초과 시 알림\n• 추가 예약 가능 (경고 표시)\n• 베이직 업그레이드 권장\n\n베이직 플랜 (100건):\n• 100건 초과 시 알림\n• 추가 예약 가능\n• 프로 플랜 권장\n\n프로 플랜 (500건): 충분한 여유\n\n갑자기 차단되는 일 없어요!' },
  { category: 'pricing', q: '카카오톡 알림 비용은 별도인가요?', a: '플랜에 포함되어 있습니다.\n\n베이직 플랜:\n• 월 200건 포함\n• 초과 시 건당 50원\n• 대부분 추가 비용 없음\n\n프로 플랜: 무제한 무료\n\n평균 사용량:\n• 고객 1명당 월 3건 정도 (확정, 리마인더, 완료)\n• 월 예약 100건 = 알림 300건\n• 베이직 플랜으로 충분\n\n추가 비용 걱정 No!' },

  // 4. 기술 지원
  { category: 'support', q: '문제가 생기면 어떻게 하나요?', a: '빠르게 지원해드립니다!\n\n이메일 지원 (모든 플랜):\n• support@moer.io\n• 평균 응답: 4시간 이내\n• 평일/주말 관계없이 답변\n\n전화 지원 (프로 플랜):\n• 1588-XXXX\n• 평일 9:00 - 18:00\n• 즉시 상담\n\n카카오톡 채널:\n• @moer\n• 빠른 문의\n• 실시간 답변\n\n개발자가 직접 답변드려요!' },
  { category: 'support', q: '사용 방법을 가르쳐주나요?', a: '다양한 방법으로 지원합니다.\n\n튜토리얼 영상:\n• YouTube 채널\n• 5-10분 짧은 영상\n• 기능별 상세 설명\n• 언제든 무료 시청\n\n이용 가이드 문서:\n• 홈페이지 > 고객지원\n• 단계별 스크린샷\n• PDF 다운로드 가능\n\n1:1 화상 교육 (프로 플랜):\n• Zoom/Google Meet\n• 30분 무료 교육\n• 예약제 운영\n\n초보자도 쉽게 배울 수 있어요!' },
  { category: 'support', q: '데이터는 안전한가요?', a: '100% 안전합니다!\n\n보안 조치:\n• SSL 암호화 (https://)\n• 네이버 클라우드 인프라\n• 정기 백업 (자동)\n• 개인정보보호법 준수\n• 금융권 수준 보안\n\n백업 정책:\n• 매일 자동 백업\n• 30일 보관\n• 데이터 복구 가능\n• 추가 비용 없음\n\n안심하고 사용하세요!' },
  { category: 'support', q: '서비스가 갑자기 중단될 수 있나요?', a: '걱정하지 마세요.\n\n안정성 보장:\n• 99.9% 가동률 목표\n• 24시간 모니터링\n• 장애 시 즉시 복구\n• 예방 점검 (새벽 시간)\n\n점검 알림:\n• 최소 3일 전 공지\n• 이메일 + 카카오톡\n• 평균 점검 시간: 30분\n\n만약의 경우 데이터 보장:\n• 백업 데이터 제공\n• 다른 서비스로 이전 지원\n• 환불 처리\n\n5년 이상 장기 운영 계획!' },
  { category: 'support', q: '기능 추가 요청할 수 있나요?', a: '물론입니다! 적극 환영합니다.\n\n요청 방법:\n• 이메일: feedback@moer.io\n• 대시보드 내 "기능 제안"\n• 카카오톡 채널\n\n처리 프로세스:\n1. 요청 접수 및 검토\n2. 우선순위 판단\n3. 개발 계획 수립\n4. 베타 테스트\n5. 정식 릴리즈\n\n실제로 반영된 사례:\n• "디자이너별 출근 설정"\n• "예약 메모 기능"\n• "휴무일 반복 설정"\n\n여러분의 목소리를 듣습니다!' },

  // 5. 업종별
  { category: 'industry', q: '(미용실) 포트폴리오를 꼭 올려야 하나요?', a: '선택 사항입니다.\n\n포트폴리오 장점:\n• 신규 고객 유입\n• 스타일 미리 확인\n• 예약 전환율 up\n• 브랜드 이미지 향상\n\n없어도 사용 가능:\n• 기본 예약 기능은 동일\n\n추천:\n• 최소 5-10장 업로드\n• 다양한 스타일 보여주기\n• 신규 고객 효과 확실!\n\n고객들이 진짜 좋아해요!' },
  { category: 'industry', q: '(필라테스) 수강권은 어떻게 관리하나요?', a: '간편하게 관리 가능합니다.\n\n수강권 등록:\n• 고객 선택\n• 수강권 타입 (10회권, 1개월권 등)\n• 시작일/만료일\n• 잔여 횟수\n\n자동 차감:\n• 출석 체크 시 자동 -1\n• 잔여 횟수 자동 표시\n• 만료일 자동 알림\n\n수강권 연장:\n• 클릭 한 번으로 연장\n• 잔여 횟수 이월 가능\n• 이력 자동 기록\n\n고객도 잔여 횟수 확인 가능!' },
  { category: 'industry', q: '(스터디카페) 좌석 배치도는 어떻게 만드나요?', a: '드래그앤드롭으로 쉽게!\n\n좌석 추가:\n• "좌석 추가" 버튼\n• 좌석 번호/타입 선택\n• 위치 드래그\n• 저장\n\n좌석 타입:\n• 1인석\n• 4인 스터디룸\n• 8인 회의실\n• 커스텀\n\n층별 구분 가능:\n• 1층, 2층 구분\n• 탭으로 전환\n• 각 층별 배치도\n\n실시간 예약 현황 표시:\n• 빈 좌석/예약석 색상 구분\n\n시각적으로 한눈에!' },

  // 6. 기타
  { category: 'etc', q: '이용약관과 개인정보처리방침은 어디서 확인하나요?', a: '홈페이지 하단에서 확인 가능합니다.\n\n위치: 푸터 > 이용약관 / 개인정보처리방침\n\n주요 내용:\n• 서비스 이용 규정\n• 개인정보 수집/이용\n• 제3자 제공 (없음)\n• 환불 정책\n• 면책 조항\n\n개인정보보호법 완벽 준수, 투명하게 공개합니다!' },
  { category: 'etc', q: '제휴 문의는 어떻게 하나요?', a: '제휴 담당자에게 연락주세요.\n\n제휴 유형:\n• 웹 에이전시\n• POS 업체\n• 마케팅 대행사\n• 프랜차이즈 본부\n• 기타 제휴\n\n문의:\n• 이메일: partner@moer.io\n• 전화: 1588-XXXX\n• 제안서 첨부\n\n검토 후 1주일 이내 회신, 상생 협력 환영합니다!' },
  { category: 'etc', q: '추천인 제도가 있나요?', a: '네, 있습니다!\n\n혜택:\n• 추천인 (나): 다음 달 50% 할인\n• 피추천인 (친구): 첫 달 50% 할인\n• 3명 추천 시: 1개월 무료\n\n추천 방법:\n1. 대시보드 > 추천 코드 확인\n2. 친구에게 코드 공유\n3. 친구가 가입 시 코드 입력\n4. 자동으로 할인 적용\n\n제한 없음, 추천 인원수 무제한!\n\n함께 사용하면 더 저렴!' },
  { category: 'etc', q: '서비스를 그만 쓰고 싶으면 어떻게 하나요?', a: '언제든 간단히 해지 가능합니다.\n\n해지 방법:\n1. 대시보드 로그인\n2. 구독 관리 메뉴\n3. "구독 해지" 버튼\n4. 해지 사유 선택 (선택)\n5. 최종 확인\n6. 즉시 해지 완료\n\n데이터 보관:\n• 해지 후 30일간 보관\n• 30일 내 재가입 시 복구 가능\n• 30일 후 완전 삭제\n\n환불: 남은 기간 일할 환불, 5영업일 이내 처리\n\n떠나시는 건 아쉽지만 언제든 환영합니다!' },
  { category: 'etc', q: '외국어는 지원하나요?', a: '현재는 한국어만 지원합니다.\n\n향후 계획:\n• 영어 (2026년 하반기)\n• 일본어 (2027년)\n• 중국어 (2027년)\n\n현재 사용 가능 국가: 대한민국\n\n해외 진출 준비 중, 글로벌 서비스 목표!' },
]

// 필터링된 FAQ
const filteredFaqs = computed(() => {
  let result = faqs

  // 카테고리 필터
  if (selectedCategory.value !== 'all') {
    result = result.filter(faq => faq.category === selectedCategory.value)
  }

  // 검색어 필터
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(faq =>
      faq.q.toLowerCase().includes(query) ||
      faq.a.toLowerCase().includes(query)
    )
  }

  return result
})

function startFreeTrial() {
  router.push('/register')
}

function contactSupport() {
  router.push('/support')
}
</script>

<template>
  <div class="faq-page">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <VContainer>
        <div class="text-center mb-8">
          <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">
            자주 묻는 질문
          </h1>
          <p class="text-h6 text-medium-emphasis mb-6">
            궁금하신 점을 빠르게 찾아보세요<br>
            찾으시는 답변이 없다면 1:1 문의를 이용해주세요
          </p>

          <!-- 검색 바 -->
          <VRow justify="center">
            <VCol cols="12" md="8" lg="6">
              <VTextField
                v-model="searchQuery"
                placeholder="질문 검색..."
                prepend-inner-icon="ri-search-line"
                variant="outlined"
                clearable
                hide-details
              />
            </VCol>
          </VRow>
        </div>
      </VContainer>
    </section>

    <!-- FAQ 섹션 -->
    <section class="faq-section py-12">
      <VContainer>
        <!-- 카테고리 탭 -->
        <VTabs
          v-model="selectedCategory"
          class="mb-8"
          show-arrows
          center-active
        >
          <VTab
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            <VIcon :icon="cat.icon" start size="20" />
            {{ cat.title }}
          </VTab>
        </VTabs>

        <!-- FAQ 목록 -->
        <VRow justify="center">
          <VCol cols="12" md="10" lg="8">
            <div v-if="filteredFaqs.length > 0">
              <VExpansionPanels>
                <VExpansionPanel
                  v-for="(faq, index) in filteredFaqs"
                  :key="index"
                >
                  <VExpansionPanelTitle class="text-h6 font-weight-medium">
                    <VIcon icon="ri-question-line" class="me-3" color="primary" />
                    {{ faq.q }}
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="text-body-1 pa-4" style="white-space: pre-line;">
                      {{ faq.a }}
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </div>

            <!-- 검색 결과 없음 -->
            <VCard v-else class="text-center pa-12" variant="tonal">
              <VIcon icon="ri-emotion-sad-line" size="64" color="warning" class="mb-4" />
              <h3 class="text-h5 mb-4">
                찾으시는 질문이 없으신가요?
              </h3>
              <p class="text-body-1 text-medium-emphasis mb-6">
                아래 방법으로 문의해주세요
              </p>
              <div class="mb-6">
                <VCard variant="outlined" class="pa-4 mb-3">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-mail-line" size="32" color="primary" class="me-3" />
                    <div class="text-left">
                      <div class="font-weight-bold">이메일</div>
                      <div class="text-body-2">support@moer.io (평균 응답: 4시간 이내)</div>
                    </div>
                  </div>
                </VCard>
                <VCard variant="outlined" class="pa-4">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-kakao-talk-line" size="32" color="success" class="me-3" />
                    <div class="text-left">
                      <div class="font-weight-bold">카카오톡</div>
                      <div class="text-body-2">@moer (실시간 상담)</div>
                    </div>
                  </div>
                </VCard>
              </div>
              <VBtn color="primary" size="large" @click="contactSupport">
                1:1 문의하기
              </VBtn>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- CTA 섹션 -->
    <section class="cta-section py-16 bg-surface">
      <VContainer>
        <VRow align="center" justify="center">
          <VCol cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-bold mb-4">
              더 궁금한 점이 있으신가요?
            </h2>
            <p class="text-h6 text-medium-emphasis mb-6">
              직접 체험해보시면 더 쉽게 이해하실 수 있습니다
            </p>
            <div class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                size="large"
                variant="outlined"
                prepend-icon="ri-customer-service-line"
                @click="contactSupport"
              >
                1:1 문의하기
              </VBtn>
              <VBtn
                size="large"
                color="primary"
                prepend-icon="ri-rocket-line"
                @click="startFreeTrial"
              >
                무료 체험 시작하기
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.faq-page {
  width: 100%;
}

.hero-section {
  padding-block: 80px 40px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.faq-section {
  background-color: rgb(var(--v-theme-background));
}

.cta-section {
  background-color: rgb(var(--v-theme-surface));
}
</style>

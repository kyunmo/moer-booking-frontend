/**
 * 업종 타입 상수
 * 백엔드 API와 일치하는 업종 타입
 */

export const BUSINESS_TYPES = {
  BEAUTY_SHOP: 'BEAUTY_SHOP',
  PILATES: 'PILATES',
  YOGA: 'YOGA',
  CAFE: 'CAFE',
  STUDY_CAFE: 'STUDY_CAFE',
  WORKSHOP: 'WORKSHOP',
  ACADEMY: 'ACADEMY',
  PET_SALON: 'PET_SALON',
  OTHER: 'OTHER',
}

/**
 * 업종 타입 한글 레이블
 */
export const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.BEAUTY_SHOP]: '미용실',
  [BUSINESS_TYPES.PILATES]: '필라테스',
  [BUSINESS_TYPES.YOGA]: '요가',
  [BUSINESS_TYPES.CAFE]: '카페',
  [BUSINESS_TYPES.STUDY_CAFE]: '스터디카페',
  [BUSINESS_TYPES.WORKSHOP]: '공방',
  [BUSINESS_TYPES.ACADEMY]: '학원',
  [BUSINESS_TYPES.PET_SALON]: '애견미용',
  [BUSINESS_TYPES.OTHER]: '기타',
}

/**
 * 업종 선택 옵션 (VSelect용)
 */
export const BUSINESS_TYPE_OPTIONS = [
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.BEAUTY_SHOP], value: BUSINESS_TYPES.BEAUTY_SHOP },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.PILATES], value: BUSINESS_TYPES.PILATES },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.YOGA], value: BUSINESS_TYPES.YOGA },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.CAFE], value: BUSINESS_TYPES.CAFE },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.STUDY_CAFE], value: BUSINESS_TYPES.STUDY_CAFE },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.WORKSHOP], value: BUSINESS_TYPES.WORKSHOP },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.ACADEMY], value: BUSINESS_TYPES.ACADEMY },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.PET_SALON], value: BUSINESS_TYPES.PET_SALON },
  { title: BUSINESS_TYPE_LABELS[BUSINESS_TYPES.OTHER], value: BUSINESS_TYPES.OTHER },
]

/**
 * 업종별 아이콘 매핑 (heading/상세보기용)
 */
export const BUSINESS_TYPE_ICONS = {
  [BUSINESS_TYPES.BEAUTY_SHOP]: 'ri-scissors-cut-line',
  [BUSINESS_TYPES.PILATES]: 'ri-heart-pulse-line',
  [BUSINESS_TYPES.YOGA]: 'ri-user-heart-line',
  [BUSINESS_TYPES.CAFE]: 'ri-cup-line',
  [BUSINESS_TYPES.STUDY_CAFE]: 'ri-book-open-line',
  [BUSINESS_TYPES.WORKSHOP]: 'ri-hammer-line',
  [BUSINESS_TYPES.ACADEMY]: 'ri-graduation-cap-line',
  [BUSINESS_TYPES.PET_SALON]: 'ri-bear-smile-line',
  [BUSINESS_TYPES.OTHER]: 'ri-store-2-line',
}

/**
 * 업종별 line 아이콘 매핑 (네비게이션/폼 필드용)
 */
export const BUSINESS_TYPE_ICONS_LINE = {
  [BUSINESS_TYPES.BEAUTY_SHOP]: 'ri-scissors-line',
  [BUSINESS_TYPES.PILATES]: 'ri-heart-pulse-line',
  [BUSINESS_TYPES.YOGA]: 'ri-user-heart-line',
  [BUSINESS_TYPES.CAFE]: 'ri-cup-line',
  [BUSINESS_TYPES.STUDY_CAFE]: 'ri-book-open-line',
  [BUSINESS_TYPES.WORKSHOP]: 'ri-hammer-line',
  [BUSINESS_TYPES.ACADEMY]: 'ri-graduation-cap-line',
  [BUSINESS_TYPES.PET_SALON]: 'ri-bear-smile-line',
  [BUSINESS_TYPES.OTHER]: 'ri-store-2-line',
}

/**
 * 업종 타입에 대한 한글 레이블 반환
 * @param {string} businessType - 업종 타입
 * @returns {string} 한글 레이블
 */
export function getBusinessTypeLabel(businessType) {
  return BUSINESS_TYPE_LABELS[businessType] || businessType
}

/**
 * 업종 타입에 대한 아이콘 반환
 * @param {string} businessType - 업종 타입
 * @param {'default'|'line'} variant - 아이콘 변형
 * @returns {string} 아이콘 이름
 */
export function getBusinessTypeIcon(businessType, variant = 'default') {
  const icons = variant === 'line' ? BUSINESS_TYPE_ICONS_LINE : BUSINESS_TYPE_ICONS
  return icons[businessType] || 'ri-store-2-line'
}

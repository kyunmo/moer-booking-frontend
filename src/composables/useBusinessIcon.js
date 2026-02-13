import { BUSINESS_TYPE_ICONS, BUSINESS_TYPE_ICONS_LINE } from '@/constants/businessTypes'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

/**
 * 로그인한 사업자의 업종에 맞는 아이콘을 반환하는 컴포저블
 */
export function useBusinessIcon() {
  const authStore = useAuthStore()

  /** heading/상세보기용 아이콘 (ri-scissors-cut-line 대체) */
  const serviceIcon = computed(() => {
    return BUSINESS_TYPE_ICONS[authStore.businessType] || 'ri-store-2-line'
  })

  /** 네비게이션/폼 필드용 아이콘 (ri-scissors-line 대체) */
  const serviceIconLine = computed(() => {
    return BUSINESS_TYPE_ICONS_LINE[authStore.businessType] || 'ri-store-2-line'
  })

  /**
   * 카테고리별 아이콘 반환
   * - categoryName(문자열)으로 매칭
   * - 미용실(BEAUTY_SHOP): 카테고리별 아이콘
   * - 기타 업종: 업종 아이콘 사용
   */
  function getCategoryIcon(categoryName) {
    if (authStore.businessType === 'BEAUTY_SHOP') {
      const icons = {
        '컷': 'ri-scissors-cut-line',
        '펌': 'ri-contrast-2-line',
        '염색': 'ri-palette-line',
        '클리닉': 'ri-heart-pulse-line',
        '스타일링': 'ri-magic-line',
        '기타': 'ri-more-line',
      }
      return icons[categoryName] || 'ri-folder-line'
    }
    return serviceIcon.value
  }

  /**
   * 카테고리별 색상 반환
   */
  function getCategoryColor(categoryName) {
    const colors = {
      '컷': 'primary',
      '펌': 'info',
      '염색': 'warning',
      '클리닉': 'success',
      '스타일링': 'deep-purple',
      '기타': 'secondary',
    }
    return colors[categoryName] || 'default'
  }

  return {
    serviceIcon,
    serviceIconLine,
    getCategoryIcon,
    getCategoryColor,
  }
}

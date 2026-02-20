/**
 * SEO 메타 태그 유틸리티
 * document.head의 meta 태그를 동적으로 관리합니다.
 */

const SITE_NAME = 'YEMO'
const DEFAULT_TITLE = 'YEMO - 예약 관리 자동화 솔루션'
const DEFAULT_DESCRIPTION = '예약 관리, 이제 자동으로 해결하세요. 고객이 직접 예약하고 카카오톡으로 자동 알림. 5분이면 시작 가능.'
const DEFAULT_IMAGE = '/og-image.png'

/**
 * meta 태그를 설정하거나 업데이트합니다.
 * @param {string} attribute - 'name' 또는 'property'
 * @param {string} key - meta 태그의 name/property 값
 * @param {string} content - meta 태그의 content 값
 */
function setMetaTag(attribute, key, content) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`)
  if (element) {
    element.setAttribute('content', content)
  }
  else {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    element.setAttribute('content', content)
    document.head.appendChild(element)
  }
}

/**
 * link 태그를 설정하거나 업데이트합니다.
 * @param {string} rel - link 태그의 rel 값
 * @param {string} href - link 태그의 href 값
 */
function setLinkTag(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`)
  if (element) {
    element.setAttribute('href', href)
  }
  else {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    element.setAttribute('href', href)
    document.head.appendChild(element)
  }
}

/**
 * 라우트 메타 정보를 기반으로 SEO 태그를 업데이트합니다.
 * @param {object} route - Vue Router route 객체
 */
export function updateSeoMeta(route) {
  const meta = route.meta || {}
  const isPublicPage = meta.public === true
  const isAdminPage = route.path.startsWith('/shop-admin')

  // 타이틀 설정
  const title = meta.title || DEFAULT_TITLE
  document.title = title

  // description 설정
  const description = meta.description || DEFAULT_DESCRIPTION
  setMetaTag('name', 'description', description)

  // keywords 설정
  if (meta.keywords) {
    setMetaTag('name', 'keywords', meta.keywords)
  }

  // robots 설정: 관리자 페이지는 noindex, 공개 페이지는 index
  if (isAdminPage || !isPublicPage) {
    setMetaTag('name', 'robots', 'noindex, nofollow')
  }
  else {
    setMetaTag('name', 'robots', 'index, follow')
  }

  // 현재 URL
  const currentUrl = window.location.origin + route.fullPath

  // Open Graph 태그
  setMetaTag('property', 'og:title', title)
  setMetaTag('property', 'og:description', description)
  setMetaTag('property', 'og:url', currentUrl)
  setMetaTag('property', 'og:image', `${window.location.origin}${DEFAULT_IMAGE}`)

  // Twitter Card 태그
  setMetaTag('name', 'twitter:title', title)
  setMetaTag('name', 'twitter:description', description)
  setMetaTag('name', 'twitter:image', `${window.location.origin}${DEFAULT_IMAGE}`)

  // Canonical URL
  setLinkTag('canonical', currentUrl)
}

/**
 * 구조화된 데이터(JSON-LD)를 설정합니다.
 * @param {object} route - Vue Router route 객체
 */
export function updateStructuredData(route) {
  // 기존 JSON-LD 제거
  const existing = document.querySelector('script[type="application/ld+json"][data-seo]')
  if (existing) {
    existing.remove()
  }

  const meta = route.meta || {}
  const isPublicPage = meta.public === true

  // 공개 페이지에만 구조화된 데이터 추가
  if (!isPublicPage)
    return

  const currentUrl = window.location.origin + route.fullPath

  // 기본 Organization 스키마
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': meta.title || DEFAULT_TITLE,
    'description': meta.description || DEFAULT_DESCRIPTION,
    'url': currentUrl,
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': window.location.origin,
    },
  }

  // 랜딩 페이지의 경우 SoftwareApplication 추가
  if (route.path === '/') {
    structuredData['@type'] = 'WebSite'
    structuredData.potentialAction = {
      '@type': 'SearchAction',
      'target': `${window.location.origin}/booking?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    }
  }

  // FAQ 페이지의 경우 FAQPage 스키마
  if (route.path === '/faq') {
    structuredData['@type'] = 'FAQPage'
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-seo', 'true')
  script.textContent = JSON.stringify(structuredData)
  document.head.appendChild(script)
}

export { SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION }

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  address: { type: String, default: '' },
  addressDetail: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  businessName: { type: String, default: '' },
  height: { type: [String, Number], default: 300 },
})

const mapContainer = ref(null)
const mapInstance = ref(null)
const mapLoaded = ref(false)
const mapError = ref(false)
const errorDetail = ref('')
const resolvedLat = ref(null)
const resolvedLng = ref(null)
const centerCoords = ref(null)

let resizeObserver = null

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

function getMapHeight() {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
}

// ===== SDK 로드 =====

function loadKakaoMapSDK() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.Map) {
      resolve()
      return
    }

    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(resolve)
      return
    }

    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps"]')
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true' && window.kakao?.maps?.load) {
        window.kakao.maps.load(resolve)
        return
      }

      const onLoad = () => {
        existingScript.removeEventListener('load', onLoad)
        if (window.kakao?.maps?.load) {
          window.kakao.maps.load(resolve)
        } else {
          reject(new Error('SDK 초기화 실패'))
        }
      }

      existingScript.addEventListener('load', onLoad)
      existingScript.addEventListener('error', () => reject(new Error('SDK 로드 실패')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      window.kakao.maps.load(resolve)
    })
    script.addEventListener('error', () => reject(new Error('SDK 로드 실패')))
    document.head.appendChild(script)
  })
}

// ===== 지도 초기화 =====

function initMap(lat, lng) {
  const container = mapContainer.value
  if (!container || !window.kakao?.maps?.Map) return

  const coords = new window.kakao.maps.LatLng(lat, lng)
  centerCoords.value = coords

  const map = new window.kakao.maps.Map(container, {
    center: coords,
    level: 3,
  })

  mapInstance.value = map

  // 마커
  new window.kakao.maps.Marker({ map, position: coords })

  // CustomOverlay (인포윈도우 대체 - 완전한 스타일 제어)
  if (props.businessName) {
    const overlayContent = document.createElement('div')
    overlayContent.className = 'kakao-custom-overlay'
    overlayContent.innerHTML = `
      <div class="overlay-inner">
        <span class="overlay-title">${props.businessName}</span>
      </div>
      <div class="overlay-arrow"></div>
    `

    new window.kakao.maps.CustomOverlay({
      map,
      position: coords,
      content: overlayContent,
      yAnchor: 1.45,
    })
  }

  mapLoaded.value = true

  // 컨테이너 크기가 0이면 바로 relayout
  nextTick(() => {
    refreshMap()
  })
}

// ===== relayout + 재센터링 =====

function refreshMap() {
  const map = mapInstance.value
  const container = mapContainer.value
  if (!map || !container) return

  const { width, height } = container.getBoundingClientRect()
  if (width > 0 && height > 0) {
    map.relayout()
    if (centerCoords.value) {
      map.setCenter(centerCoords.value)
    }
  }
}

// ===== Geocoder =====

function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) })
      } else {
        reject(new Error('주소를 찾을 수 없습니다'))
      }
    })
  })
}

// ===== Setup =====

async function setupMap() {
  if (!KAKAO_MAP_KEY) {
    mapError.value = true
    errorDetail.value = 'API 키가 설정되지 않았습니다'
    return
  }

  if (!props.address && !props.latitude) {
    mapError.value = true
    errorDetail.value = '주소 정보가 없습니다'
    return
  }

  try {
    await loadKakaoMapSDK()

    if (props.latitude && props.longitude) {
      resolvedLat.value = props.latitude
      resolvedLng.value = props.longitude
      initMap(props.latitude, props.longitude)
      return
    }

    if (props.address) {
      const cleanAddress = props.address.replace(/\s*\(.*\)\s*$/, '')
      const { lat, lng } = await geocodeAddress(cleanAddress)
      resolvedLat.value = lat
      resolvedLng.value = lng
      initMap(lat, lng)
      return
    }

    mapError.value = true
    errorDetail.value = '표시할 위치 정보가 없습니다'
  } catch (err) {
    mapError.value = true
    errorDetail.value = err?.message || '지도 로드 실패'
  }
}

// ===== ResizeObserver - 탭 전환 시 relayout 처리 =====

function setupResizeObserver() {
  if (!mapContainer.value) return

  resizeObserver = new ResizeObserver(() => {
    if (mapInstance.value && mapLoaded.value) {
      refreshMap()
    }
  })
  resizeObserver.observe(mapContainer.value)
}

// ===== Lifecycle =====

onMounted(() => {
  setupMap()
  setupResizeObserver()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(
  () => [props.address, props.latitude, props.longitude],
  () => {
    if (mapInstance.value) {
      mapLoaded.value = false
      mapError.value = false
      errorDetail.value = ''
      setupMap()
    }
  },
)
</script>

<template>
  <div class="kakao-map-wrapper" :style="{ minHeight: getMapHeight() }">
    <!-- 지도 컨테이너 (항상 렌더링) -->
    <div
      ref="mapContainer"
      :style="{ height: getMapHeight() }"
      class="kakao-map"
    />

    <!-- 로딩 오버레이 -->
    <div
      v-if="!mapLoaded && !mapError"
      class="map-overlay d-flex align-center justify-center"
      :style="{ height: getMapHeight() }"
    >
      <VProgressCircular indeterminate color="primary" size="32" />
    </div>

    <!-- 에러 오버레이 -->
    <div
      v-if="mapError"
      class="map-overlay d-flex flex-column align-center justify-center"
      :style="{ height: getMapHeight() }"
    >
      <VIcon icon="ri-map-2-line" size="32" color="medium-emphasis" class="mb-2" />
      <span class="text-body-2 text-medium-emphasis">지도를 불러올 수 없습니다</span>
      <span v-if="errorDetail" class="text-caption text-disabled mt-1">{{ errorDetail }}</span>
    </div>

    <!-- 길찾기 링크 -->
    <div v-if="mapLoaded && address" class="map-actions">
      <VBtn
        :href="resolvedLat && resolvedLng
          ? `https://map.kakao.com/link/to/${businessName || '목적지'},${resolvedLat},${resolvedLng}`
          : `https://map.kakao.com/link/search/${address}`"
        target="_blank"
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="ri-direction-line"
      >
        길찾기
      </VBtn>
      <VBtn
        :href="`https://map.kakao.com/link/search/${address}`"
        target="_blank"
        variant="text"
        size="small"
        prepend-icon="ri-external-link-line"
        class="text-medium-emphasis"
      >
        카카오맵에서 보기
      </VBtn>
    </div>
  </div>
</template>

<style scoped>
.kakao-map-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.kakao-map {
  width: 100%;
}

.map-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(var(--v-theme-surface), 0.95);
  z-index: 1;
}

.map-actions {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background-color: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>

<!-- CustomOverlay 전역 스타일 (scoped 밖) -->
<style>
.kakao-custom-overlay {
  position: relative;
  cursor: default;
}

.kakao-custom-overlay .overlay-inner {
  background: rgb(var(--v-theme-primary, 104, 101, 241));
  background: #6C63FF;
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  text-align: center;
}

.kakao-custom-overlay .overlay-title {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.kakao-custom-overlay .overlay-arrow {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 8px solid #6C63FF;
  margin: 0 auto;
}
</style>

<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import pages404 from '@images/pages/404.png'
import miscMaskDark from '@images/misc/misc-mask-dark.png'
import miscMaskLight from '@images/misc/misc-mask-light.png'
import miscObj from '@images/pages/misc-404-object.png'

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

definePage({
  alias: '/pages/misc/not-found/:error(.*)',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="404"
      title="페이지를 찾을 수 없습니다"
      description="요청하신 페이지가 존재하지 않거나 이동되었습니다."
      class="mb-10"
    />

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="pages404"
        alt="Coming Soon"
        :height="$vuetify.display.xs ? 400 : 500"
        class="my-sm-5"
      />

      <VBtn
        to="/"
        class="mt-10"
      >
        홈으로 돌아가기
      </VBtn>

      <VImg
        :src="authThemeMask"
        class="d-none d-md-block footer-coming-soon flip-in-rtl"
        cover
      />

      <VImg
        :src="miscObj"
        class="d-none d-md-block footer-coming-soon-obj"
        :max-width="177"
        height="160"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>

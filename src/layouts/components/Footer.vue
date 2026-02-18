<template>
  <div class="h-100 d-flex align-center justify-space-between text-medium-emphasis">
    <!-- 👉 Footer: left content -->
    <div class="d-flex align-center text-base">
      &copy;
      {{ new Date().getFullYear() }},
      Made With By
      <a
        href="https://moer.io"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >MOER</a>
    </div>

    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <RouterLink
        to="/terms"
        class="text-primary text-decoration-none"
      >
        이용약관
      </RouterLink>
      <RouterLink
        to="/privacy"
        class="text-primary text-decoration-none"
      >
        개인정보처리방침
      </RouterLink>
      <RouterLink
        to="/refund-policy"
        class="text-primary text-decoration-none"
      >
        환불정책
      </RouterLink>
      <RouterLink
        to="/support"
        class="text-primary text-decoration-none"
      >
        고객지원
      </RouterLink>
      <a
        href="mailto:kkm@moer.io"
        class="text-primary text-decoration-none"
      >
        문의하기
      </a>
    </span>
  </div>
</template>

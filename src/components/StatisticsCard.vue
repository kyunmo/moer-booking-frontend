<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between">
        <div class="d-flex flex-column gap-y-1">
          <div class="text-body-1 text-high-emphasis">
            {{ title }}
          </div>
          <h4 class="text-h4">
            {{ value }}
          </h4>
          <div
            v-if="subtitle"
            class="text-body-2"
          >
            {{ subtitle }}
          </div>
        </div>
        <VAvatar
          :color="color"
          variant="tonal"
          rounded="lg"
          size="42"
        >
          <VIcon
            :icon="icon"
            size="26"
          />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>

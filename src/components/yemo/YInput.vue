<script setup>
import { Icon } from '@iconify/vue'
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
  appendIcon: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = useId()
const hasError = computed(() => !!props.error)
</script>

<template>
  <div class="y-input-wrap" :class="{ 'y-input-wrap--error': hasError, 'y-input-wrap--disabled': disabled }">
    <label v-if="label" :for="inputId" class="y-input-label">
      {{ label }}
      <span v-if="required" class="y-input-required" aria-hidden="true">*</span>
    </label>

    <div class="y-input-field" :class="`y-input-field--${size}`">
      <Icon v-if="prependIcon" :icon="prependIcon" class="y-input-icon y-input-icon--prepend" aria-hidden="true" />
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="hasError || undefined"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        class="y-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
      <Icon v-if="appendIcon" :icon="appendIcon" class="y-input-icon y-input-icon--append" aria-hidden="true" />
    </div>

    <div v-if="error" :id="`${inputId}-error`" class="y-input-error" role="alert">{{ error }}</div>
    <div v-else-if="hint" :id="`${inputId}-hint`" class="y-input-hint">{{ hint }}</div>
  </div>
</template>

<style lang="scss" scoped>
.y-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--disabled { opacity: 0.5; pointer-events: none; }
}

.y-input-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--y-text-muted);
  letter-spacing: 0.02em;
}
.y-input-required { color: var(--y-danger); margin-left: 2px; }

.y-input-field {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius);
  transition: border-color var(--y-dur-fast) var(--y-ease), box-shadow var(--y-dur-fast) var(--y-ease);

  &:focus-within { border-color: var(--y-accent); box-shadow: var(--y-shadow-focus); }

  &--sm { min-height: 36px; padding: 0 12px; }
  &--md { min-height: 44px; padding: 0 14px; }
  &--lg { min-height: 52px; padding: 0 16px; }
}

.y-input {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--y-text);
  &::placeholder { color: var(--y-text-disabled); }
}

.y-input-icon { width: 18px; height: 18px; color: var(--y-text-muted); flex-shrink: 0; }
.y-input-icon--prepend { margin-right: 8px; }
.y-input-icon--append { margin-left: 8px; }

.y-input-wrap--error .y-input-field {
  border-color: var(--y-danger);
  &:focus-within { box-shadow: 0 0 0 4px rgba(184, 74, 74, 0.18); }
}

.y-input-hint  { font-size: 12px; color: var(--y-text-muted); }
.y-input-error { font-size: 12px; color: var(--y-danger); font-weight: 500; }
</style>

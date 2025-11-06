<script setup lang="ts">
import { computed, ref } from 'vue'

interface InputProps {
  /** The aria-describedby attribute, referencing an element that describes the input. */
  ariaDescribedBy?: string
  /** The aria-label for screen readers. Falls back to label if not provided. */
  ariaLabel?: string
  /** The autocomplete attribute value (e.g., 'email', 'name', 'off'). */
  autocomplete?: string
  /** Whether to show a clear button (X icon) when the input has a value. */
  clearable?: boolean
  /** Whether the input is disabled. Applies disabled styling and prevents interaction. */
  disabled?: boolean
  /** The unique identifier for the input element. Auto-generated if not provided. */
  id?: string
  /** The label text displayed above the input field. */
  label?: string
  /** The input value for controlled mode. When provided, the component is controlled by the parent. */
  modelValue?: string
  /** The name attribute for the input element, used for form submission. */
  name?: string
  /** Placeholder text shown when the input is empty. */
  placeholder?: string
  /** Whether the input is required. Shows a red asterisk and sets aria-required. */
  required?: boolean
  /** The input type (e.g., 'text', 'email', 'password', 'number'). Defaults to 'text'. */
  type?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  clearable: false,
  disabled: false,
  modelValue: undefined,
  required: false,
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Local state for uncontrolled mode
const localValue = ref('')

// Generate unique ID for accessibility if not provided (stable across re-renders)
const uniqueId = `input-${Math.random().toString(36).slice(2, 11)}`
const inputId = computed(() => props.id || uniqueId)
const labelId = computed(() => `label-${inputId.value}`)

// Computed value that uses modelValue if provided (controlled), otherwise uses localValue (uncontrolled)
const inputValue = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : localValue.value),
  set: (value: string) => {
    if (props.modelValue !== undefined) {
      // Controlled mode: emit update
      emit('update:modelValue', value)
    } else {
      // Uncontrolled mode: update local state
      localValue.value = value
    }
  },
})

// Handle input event
function handleInput(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    inputValue.value = event.target.value
  }
}

// Check if clear button should be visible
const showClearButton = computed(() => {
  return props.clearable && !props.disabled && inputValue.value.length > 0
})

// Handle clear button click
function handleClear() {
  inputValue.value = ''
  // Focus the input after clearing
  const inputElement = document.getElementById(inputId.value)
  if (inputElement instanceof HTMLInputElement) {
    inputElement.focus()
  }
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      :id="labelId"
      class="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 dark:text-red-400" aria-label="required">*</span>
    </label>
    <div class="relative w-full">
      <input
        :id="inputId"
        :name="name || inputId"
        :type="type"
        :value="inputValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-label="ariaLabel || label"
        :aria-describedby="ariaDescribedBy"
        :aria-required="required"
        :class="[
          'w-full py-2 text-base text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 dark:focus:ring-primary-400/30 focus:border-primary-500 dark:focus:border-primary-400 disabled:bg-neutral-100 dark:disabled:bg-neutral-900 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 dark:disabled:border-neutral-700 transition-colors duration-200',
          clearable ? 'px-4 pr-10' : 'px-4',
        ]"
        @input="handleInput"
      />
      <button
        v-if="showClearButton"
        type="button"
        @click="handleClear"
        :aria-label="`Clear ${label || 'input'}`"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

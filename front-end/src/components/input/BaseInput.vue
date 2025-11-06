<script setup lang="ts">
import { computed, ref } from 'vue'

interface InputProps {
  /** The input value for controlled mode. When provided, the component is controlled by the parent. */
  modelValue?: string
  /** The label text displayed above the input field. */
  label?: string
  /** The input type (e.g., 'text', 'email', 'password', 'number'). Defaults to 'text'. */
  type?: string
  /** Placeholder text shown when the input is empty. */
  placeholder?: string
  /** Whether the input is required. Shows a red asterisk and sets aria-required. */
  required?: boolean
  /** Whether the input is disabled. Applies disabled styling and prevents interaction. */
  disabled?: boolean
  /** The unique identifier for the input element. Auto-generated if not provided. */
  id?: string
  /** The name attribute for the input element, used for form submission. */
  name?: string
  /** The autocomplete attribute value (e.g., 'email', 'name', 'off'). */
  autocomplete?: string
  /** The aria-label for screen readers. Falls back to label if not provided. */
  ariaLabel?: string
  /** The aria-describedby attribute, referencing an element that describes the input. */
  ariaDescribedBy?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: undefined,
  type: 'text',
  required: false,
  disabled: false,
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
      class="w-full px-4 py-2 text-base text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 disabled:bg-neutral-100 dark:disabled:bg-neutral-900 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 dark:disabled:border-neutral-700 transition-colors duration-200"
      @input="handleInput"
    />
  </div>
</template>

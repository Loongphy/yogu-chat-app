<template>
  <button
    type="button"
    :class="[
      modelValue
        ? 'bg-black dark:bg-[#4D4F56]'
        : 'bg-gray-200 dark:bg-[#323438]',
      'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#DFE1E4] dark:focus:ring-[#3E4045]',
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      :class="[
        modelValue ? 'translate-x-4' : 'translate-x-0',
        'pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#F0F0F0] shadow ring-0 transition duration-200 ease-in-out',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

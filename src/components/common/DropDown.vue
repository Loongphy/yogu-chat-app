<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

interface Props {
  modelValue?: boolean;
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end";
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  placement: "bottom",
  fullWidth: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(props.modelValue);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue: boolean) => {
    isOpen.value = newValue;
  }
);

// 监听 isOpen 变化
watch(isOpen, (newValue: boolean) => {
  emit("update:modelValue", newValue);
});

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <div @click="isOpen = !isOpen">
      <slot name="trigger" />
    </div>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-show="isOpen"
        :class="[
          'absolute z-10 rounded-md bg-white dark:bg-[#2B2D30] shadow-lg ring-1 ring-[#EbECF0] dark:ring-[#4A4B4E] focus:outline-none dark:shadow-gray-900/50',
          fullWidth ? 'w-full' : 'w-auto',
          {
            'right-0 top-full mt-1': placement === 'bottom-end',
            'left-0 top-full mt-1': placement === 'bottom-start',
            'left-1/2 -translate-x-1/2 top-full mt-1': placement === 'bottom',
            'right-0 bottom-full mb-1': placement === 'top-end',
            'left-0 bottom-full mb-1': placement === 'top-start',
            'left-1/2 -translate-x-1/2 bottom-full mb-1': placement === 'top',
            'left-full top-0 ml-1': placement === 'right-start',
            'left-full bottom-0 ml-1': placement === 'right-end',
            'left-full top-1/2 -translate-y-1/2 ml-1': placement === 'right',
            'right-full top-0 mr-1': placement === 'left-start',
            'right-full bottom-0 mr-1': placement === 'left-end',
            'right-full top-1/2 -translate-y-1/2 mr-1': placement === 'left',
          },
        ]"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

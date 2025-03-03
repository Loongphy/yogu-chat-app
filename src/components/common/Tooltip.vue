<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  content: string;
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
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placement: "top",
  delay: 200,
});

const tooltipRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let showTimeout: ReturnType<typeof setTimeout> | null = null;

const showTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout);
  }
  showTimeout = setTimeout(() => {
    isVisible.value = true;
  }, props.delay);
};

const hideTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout);
  }
  isVisible.value = false;
};

onMounted(() => {
  if (triggerRef.value) {
    triggerRef.value.addEventListener("mouseenter", showTooltip);
    triggerRef.value.addEventListener("mouseleave", hideTooltip);
    triggerRef.value.addEventListener("focus", showTooltip);
    triggerRef.value.addEventListener("blur", hideTooltip);
    triggerRef.value.addEventListener("mousedown", hideTooltip);
  }
});

onUnmounted(() => {
  if (triggerRef.value) {
    triggerRef.value.removeEventListener("mouseenter", showTooltip);
    triggerRef.value.removeEventListener("mouseleave", hideTooltip);
    triggerRef.value.removeEventListener("focus", showTooltip);
    triggerRef.value.removeEventListener("blur", hideTooltip);
    triggerRef.value.removeEventListener("mousedown", hideTooltip);
  }
  if (showTimeout) {
    clearTimeout(showTimeout);
  }
});
</script>

<template>
  <div class="relative inline-block">
    <div ref="triggerRef">
      <slot />
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
        v-show="isVisible"
        ref="tooltipRef"
        class="absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded shadow-sm whitespace-nowrap"
        :class="[
          {
            'bottom-full left-1/2 -translate-x-1/2 mb-1': placement === 'top',
            'bottom-full left-0 mb-1': placement === 'top-start',
            'bottom-full right-0 mb-1': placement === 'top-end',
            'top-full left-1/2 -translate-x-1/2 mt-1': placement === 'bottom',
            'top-full left-0 mt-1': placement === 'bottom-start',
            'top-full right-0 mt-1': placement === 'bottom-end',
            'right-full top-1/2 -translate-y-1/2 mr-1': placement === 'left',
            'right-full top-0 mr-1': placement === 'left-start',
            'right-full bottom-0 mr-1': placement === 'left-end',
            'left-full top-1/2 -translate-y-1/2 ml-1': placement === 'right',
            'left-full top-0 ml-1': placement === 'right-start',
            'left-full bottom-0 ml-1': placement === 'right-end',
          },
        ]"
      >
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

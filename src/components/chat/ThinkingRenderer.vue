<template>
  <div class="mb-2">
    <!-- 思考中状态 -->
    <div
      v-if="!complete"
      class="md:-mx-4 mb-4 relative border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-clip"
    >
      <div
        class="min-h-[3.5rem] overflow-y-clip flex flex-col justify-start text-white rounded-2xl relative w-full overflow-clip foucs:outline-none focus-within:outline-none"
      >
        <div
          class="flex h-full w-full items-center justify-start text-gray-900 px-5 pt-4 gap-1 overflow-hidden"
        >
          <div
            class="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center rotating-element"
          >
            <div class="w-2.5 h-2.5 rounded-full relative" style="scale: 0.8">
              <div
                class="absolute rounded-full bg-black dark:bg-gray-200 h-full w-full"
              ></div>
              <div
                class="top-[-3.8px] absolute h-full w-full rounded-full bg-black dark:bg-gray-200 transition-[top] duration-300 ease-linear"
              ></div>
              <div
                class="right-[-3.8px] top-[-1px] absolute h-full w-full rounded-full bg-black dark:bg-gray-200 transition-[right] duration-300 ease-linear"
              ></div>
              <div
                class="left-[-3.8px] top-[-1px] absolute h-full w-full rounded-full bg-black dark:bg-gray-200 transition-[left] duration-300 ease-linear"
              ></div>
              <div
                class="right-[-2.3px] top-[3px] absolute h-full w-full rounded-full bg-black dark:bg-gray-200 transition-[right] duration-300 ease-linear"
              ></div>
              <div
                class="left-[-2.5px] top-[3.3px] absolute h-full w-full rounded-full bg-black dark:bg-gray-200 transition-[left] duration-300 ease-linear"
              ></div>
            </div>
          </div>
          <div class="flex items-baseline gap-1 overflow-hidden">
            <span class="text-base text-nowrap whitespace-nowrap">思考中</span>
          </div>
        </div>
        <div
          class="w-full overflow-hidden relative flex flex-col items-start h-[180px]"
        >
          <div
            class="w-full flex flex-col items-center justify-center relative px-4 h-full fade-mask"
          >
            <MarkdownRenderer :content="content" />
          </div>
        </div>
      </div>
    </div>

    <!-- 思考完成状态 -->
    <div
      v-else
      class="md:-mx-4 mb-4 relative border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-clip"
    >
      <div
        @click="toggleExpanded"
        class="min-h-[3.5rem] overflow-y-clip flex flex-col justify-start text-white rounded-2xl relative w-full overflow-clip foucs:outline-none focus-within:outline-none"
      >
        <div
          class="flex h-full w-full items-center justify-start text-gray-900 px-5 pt-4 gap-1 overflow-hidden"
        >
          <Lightbulb
            class="w-4 h-4 flex-shrink-0 text-black dark:text-gray-200"
          />
          <div class="flex items-baseline gap-1 overflow-hidden">
            <span class="text-base text-nowrap whitespace-nowrap"
              >思考过程</span
            >
          </div>
          <button
            class="absolute right-5 top-5 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200"
          >
            <ChevronUp v-if="isExpanded" class="h-4 w-4" />
            <ChevronDown v-else class="h-4 w-4" />
          </button>
        </div>
        <div
          class="text-gray-600 text-sm my-0 px-5 pb-4 flex flex-row items-center"
        >
          {{ isExpanded ? "折叠详情" : "展开详情" }}
        </div>
      </div>
      <div
        v-if="isExpanded"
        class="overflow-hidden text-sm pt-0 text-gray-600 flex flex-col max-w-full overflow-y-clip"
      >
        <div
          class="[&>*:first-child]:mt-0 px-5 h-fit overflow-x-auto w-full focus:outline-none focus-within:outline-none"
        >
          <MarkdownRenderer :content="content" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, ChevronUp, ChevronDown } from "lucide-vue-next";
import MarkdownRenderer from "../common/MarkdownRenderer.vue";
import { toRefs, ref } from "vue";

const props = defineProps<{
  content: string;
  complete: boolean;
}>();

const { content, complete } = toRefs(props);
const isExpanded = ref(false);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.fade-mask {
  mask-image: linear-gradient(
    180deg,
    transparent 0,
    hsla(0, 0, 0, 0.8) 40%,
    hsla(0, 0, 0, 0.8) 45%,
    transparent 90%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0,
    #000 40%,
    #000 45%,
    transparent 90%,
    transparent
  );
}

.rotating-element {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
}
</style>

<template>
  <div class="flex flex-col gap-4 px-3">
    <div class="space-y-2">
      <div
        v-for="model in displayModels"
        :key="model.id"
        class="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-[#35373C] hover:bg-gray-50 dark:hover:bg-[#35373C] dark:bg-[#2B2D31] cursor-pointer justify-between"
      >
        <div>
          <h3 class="font-medium text-gray-800 dark:text-gray-200">
            {{ model.name }}
          </h3>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ model.identifier }}
          </div>
        </div>
        <Switch
          v-model="model.enabled"
          @update:model-value="toggleModelStatus(model)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import Switch from "../common/Switch.vue";
import { useModelStore } from "../../stores/modelStore";
import { ModelStatus } from "../../services/ModelService";

// 使用 modelStore
const modelStore = useModelStore();

// 计算属性：获取用于显示的模型列表
const displayModels = computed(() => {
  return modelStore.models.map((model) => ({
    ...model,
    enabled: model.status === ModelStatus.Active,
  }));
});

// 切换模型启用状态
const toggleModelStatus = async (model: any) => {
  const newStatus = model.enabled ? ModelStatus.Active : ModelStatus.Inactive;
  await modelStore.updateModelStatus(model.id, newStatus);
};

// 初始化
onMounted(async () => {
  // 如果模型列表为空，加载模型
  if (modelStore.models.length === 0) {
    await modelStore.loadModels();
  }
});
</script>

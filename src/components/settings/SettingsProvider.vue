<template>
  <div class="flex h-full gap-1">
    <!-- 左侧 Provider 列表 -->
    <div class="w-40 flex flex-col">
      <div class="flex items-center justify-between px-4 py-2">
        <h3
          class="text-sm font-medium truncate text-gray-900 dark:text-gray-100"
        >
          {{ t("provider.title") }}
        </h3>
        <div class="flex items-center gap-1">
          <button
            @click="handleDeleteProvider"
            class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#EBECF0] dark:hover:bg-[#35373C] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
            :disabled="!selectedProvider"
          >
            <Minus class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            @click="handleAddProvider"
            class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
          >
            <Plus class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-1 px-2">
          <button
            v-for="provider in providers"
            :key="provider.id"
            @click="selectProvider(provider)"
            class="w-full px-3 py-2 flex items-center text-sm text-left rounded-xl hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
            :class="{
              'bg-[#EBECF0] dark:bg-[#35373C]':
                selectedProvider?.id === provider.id,
              'text-gray-900 dark:text-gray-100': true,
            }"
          >
            <DeepSeek
              v-if="provider.protocol === 'DeepSeek'"
              class="w-4 h-4 text-[#4D6BFE] mr-2"
            />
            <Claude
              v-if="provider.protocol === 'Claude'"
              class="w-4 h-4 text-[#D97757] mr-2"
            />
            <OpenRouter
              v-if="provider.protocol === 'OpenRouter'"
              class="w-4 h-4 text-[#18181B] dark:text-[#E0E0E0] mr-2"
            />
            <OpenAI
              v-if="provider.protocol === 'OpenAI'"
              class="w-4 h-4 text-[#000000] dark:text-[#FFFFFF] mr-2"
            />
            <Grok
              v-if="provider.protocol === 'Grok'"
              class="w-4 h-4 text-[#000000] dark:text-[#FFFFFF] mr-2"
            />
            <Gemini
              v-if="provider.protocol === 'Gemini'"
              class="w-4 h-4 text-[#1A73E8] dark:text-[#5B9BFF] mr-2"
            />
            {{ provider.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧设置表单 -->
    <div class="flex-1 flex flex-col h-full" v-if="selectedProvider">
      <div class="flex-1 overflow-y-auto px-4">
        <div class="space-y-6 py-4">
          <!-- 名称 -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >{{ t("provider.name") }}</label
            >
            <input
              type="text"
              v-model="selectedProvider.name"
              @change="watchProviderChanges"
              class="h-9 w-full rounded-md border border-[#DFE1E4] dark:border-[#35373C] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors hover:border-[#C1C3C7] dark:hover:border-[#4A4D52] focus-visible:outline-none focus-visible:ring-[#000000] dark:focus-visible:ring-[#4A4D52] focus-visible:border-[#000000] dark:focus-visible:border-[#4A4D52] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              :placeholder="t('provider.namePlaceholder')"
            />
          </div>

          <!-- Protocol -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >{{ t("provider.protocol") || "协议" }}</label
            >
            <DropDown
              v-model="showProtocolMenu"
              placement="bottom-start"
              :fullWidth="true"
            >
              <template #trigger>
                <div
                  class="h-9 w-full rounded-md border border-[#DFE1E4] dark:border-[#35373C] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors hover:border-[#C1C3C7] dark:hover:border-[#4A4D52] focus-visible:outline-none focus-visible:ring-[#000000] dark:focus-visible:ring-[#4A4D52] focus-visible:border-[#000000] dark:focus-visible:border-[#4A4D52] disabled:opacity-50 flex items-center justify-start"
                >
                  <DeepSeek
                    v-if="selectedProvider.protocol === 'DeepSeek'"
                    class="w-4 h-4 text-[#4D6BFE] inline-block mr-2"
                  />
                  <Claude
                    v-if="selectedProvider.protocol === 'Claude'"
                    class="w-4 h-4 text-[#D97757] inline-block mr-2"
                  />
                  <OpenRouter
                    v-if="selectedProvider.protocol === 'OpenRouter'"
                    class="w-4 h-4 text-[#18181B] dark:text-[#E0E0E0] inline-block mr-2"
                  />
                  <OpenAI
                    v-if="selectedProvider.protocol === 'OpenAI'"
                    class="w-4 h-4 text-[#000000] dark:text-[#FFFFFF] inline-block mr-2"
                  />
                  <Grok
                    v-if="selectedProvider.protocol === 'Grok'"
                    class="w-4 h-4 text-[#000000] dark:text-[#FFFFFF] inline-block mr-2"
                  />
                  <Gemini
                    v-if="selectedProvider.protocol === 'Gemini'"
                    class="w-4 h-4 text-[#1A73E8] dark:text-[#5B9BFF] inline-block mr-2"
                  />
                  <span class="mr-auto text-gray-900 dark:text-gray-100">{{
                    selectedProvider.protocol
                  }}</span>
                  <ChevronDown
                    class="w-4 h-4 text-gray-500 dark:text-gray-400"
                  />
                </div>
              </template>
              <div
                class="w-full py-1 max-h-40 overflow-y-auto bg-white dark:bg-[#2B2D31] border border-[#DFE1E4] dark:border-[#35373C] rounded-md shadow-lg"
              >
                <button
                  v-for="protocol in [
                    'OpenAI',
                    'Claude',
                    'DeepSeek',
                    'OpenRouter',
                    'Grok',
                    'Gemini',
                  ]"
                  :key="protocol"
                  @click="
                    selectedProvider.protocol = protocol;
                    watchProviderChanges();
                    showProtocolMenu = false;
                  "
                  class="block w-full px-4 py-2 text-sm text-left hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
                  :class="{
                    'bg-[#EBECF0] dark:bg-[#35373C]':
                      selectedProvider.protocol === protocol,
                    'text-gray-900 dark:text-gray-100': true,
                  }"
                >
                  <DeepSeek
                    v-if="protocol === 'DeepSeek'"
                    class="w-4 h-4 text-[#4D6BFE] inline-block mr-2"
                  />
                  <Claude
                    v-if="protocol === 'Claude'"
                    class="w-4 h-4 text-[#D97757] inline-block mr-2"
                  />
                  <OpenRouter
                    v-if="protocol === 'OpenRouter'"
                    class="w-4 h-4 text-[#18181B] dark:text-[#E0E0E0] inline-block mr-2"
                  />
                  <OpenAI
                    v-if="protocol === 'OpenAI'"
                    class="w-4 h-4 text-[#000000] dark:text-[#FFFFFF] inline-block mr-2"
                  />
                  <Grok
                    v-if="protocol === 'Grok'"
                    class="w-4 h-4 text-[#000000] dark:text-[#FFFFFF] inline-block mr-2"
                  />
                  <Gemini
                    v-if="protocol === 'Gemini'"
                    class="w-4 h-4 text-[#1A73E8] dark:text-[#5B9BFF] inline-block mr-2"
                  />
                  {{ protocol }}
                </button>
              </div>
            </DropDown>
          </div>

          <!-- Base URL -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >{{ t("provider.baseUrl") }}</label
            >
            <input
              type="text"
              v-model="selectedProvider.base_url"
              @change="watchProviderChanges"
              class="h-9 w-full rounded-md border border-[#DFE1E4] dark:border-[#35373C] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors hover:border-[#C1C3C7] dark:hover:border-[#4A4D52] focus-visible:outline-none focus-visible:ring-[#000000] dark:focus-visible:ring-[#4A4D52] focus-visible:border-[#000000] dark:focus-visible:border-[#4A4D52] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              :placeholder="t('provider.urlPlaceholder')"
            />
          </div>

          <!-- API Key -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >{{ t("provider.apiKey") }}</label
            >
            <div class="relative">
              <input
                :type="showApiKey ? 'text' : 'password'"
                v-model="selectedProvider.api_key"
                @change="watchProviderChanges"
                class="h-9 w-full pr-9 rounded-md border border-[#DFE1E4] dark:border-[#35373C] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors hover:border-[#C1C3C7] dark:hover:border-[#4A4D52] focus-visible:outline-none focus-visible:ring-[#000000] dark:focus-visible:ring-[#4A4D52] focus-visible:border-[#000000] dark:focus-visible:border-[#4A4D52] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :placeholder="t('provider.apiKeyPlaceholder')"
              />
              <button
                @click="showApiKey = !showApiKey"
                class="absolute right-0.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
              >
                <Eye
                  v-if="!showApiKey"
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                <EyeOff
                  v-else
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >{{ t("provider.modelId") }}</label
            >
            <div class="space-y-2">
              <div
                v-for="(model, index) in selectedProvider.models"
                :key="index"
                class="flex items-center gap-2"
              >
                <div
                  class="h-9 w-0 flex-grow rounded-md text-sm flex items-center text-gray-900 dark:text-gray-100"
                >
                  {{ model.identifier }}
                </div>
                <button
                  @click="removeModel(model.id)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
                >
                  <Minus class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <!-- 空状态提示 -->
              <div
                v-if="selectedProvider.models.length === 0"
                class="text-sm text-gray-500 dark:text-gray-400 py-2 text-center"
              >
                {{ t("provider.emptyModels") }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="text"
                v-model="newModelInput"
                class="h-8 flex-1 rounded-md border border-[#DFE1E4] dark:border-[#35373C] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors hover:border-[#C1C3C7] dark:hover:border-[#4A4D52] focus-visible:outline-none focus-visible:ring-[#000000] dark:focus-visible:ring-[#4A4D52] focus-visible:border-[#000000] dark:focus-visible:border-[#4A4D52] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :placeholder="t('provider.newModelPlaceholder')"
                @keyup.enter="addModel"
              />
              <button
                @click="addModel"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
              >
                <Plus class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-4"
    >
      <div
        class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      >
        <Settings class="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p>{{ t("provider.emptyState") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  Plus,
  Minus,
  Eye,
  EyeOff,
  ChevronDown,
  Settings,
} from "lucide-vue-next";
import { useProviderStore } from "../../stores/providerStore";
import { useModelStore } from "../../stores/modelStore";
import { ModelStatus } from "../../services/ModelService";
import { useI18n } from "vue-i18n";
import { DeepSeek, Claude, OpenRouter, OpenAI, Grok, Gemini } from "../icons";
import DropDown from "../common/DropDown.vue";

// 使用 i18n
const { t } = useI18n();

// 使用 store
const providerStore = useProviderStore();
const modelStore = useModelStore();

// 显示/隐藏 API Key
const showApiKey = ref(false);
// 新模型输入
const newModelInput = ref("");
// 加载状态
const isLoading = ref(false);
// 协议下拉菜单显示状态
const showProtocolMenu = ref(false);

// 计算属性：获取所有提供商
const providers = computed(() => providerStore.providers);

// 计算属性：获取当前选中的提供商
const selectedProvider = ref<any>(null);

// 选择提供商
const selectProvider = (provider: any) => {
  // 创建一个本地副本，包含 models 数组
  const providerCopy = { ...provider };

  // 获取该提供商关联的所有模型
  const modelProviderLinks = modelStore.getModelProvidersByProviderId(
    provider.id
  );

  // 获取模型名称列表
  providerCopy.models = [];

  // 如果有关联的模型，则获取模型名称
  if (modelProviderLinks.length > 0) {
    for (const link of modelProviderLinks) {
      const model = modelStore.models.find((m) => m.id === link.modelId);
      if (model) {
        providerCopy.models.push({
          id: model.id,
          identifier: model.identifier,
        });
      }
    }
  } else {
    providerCopy.models = [];
  }

  // 转换字段名以匹配界面
  providerCopy.api_key = providerCopy.apiKey || "";
  providerCopy.base_url = providerCopy.baseUrl || "";
  providerCopy.protocol = providerCopy.protocol || "OpenAI";

  selectedProvider.value = providerCopy;
};

// 添加提供商
const handleAddProvider = async () => {
  try {
    isLoading.value = true;
    console.log("开始添加提供商...");

    // 直接使用 providerStore 的方法添加提供商
    const providerId = await providerStore.addProvider(
      "新服务",
      "",
      "",
      "OpenAI"
    );
    console.log("提供商添加结果:", providerId);

    if (providerId) {
      const newProvider = providerStore.providers.find(
        (p) => p.id === providerId
      );
      console.log("找到新提供商:", newProvider);

      if (newProvider) {
        selectProvider(newProvider);
      } else {
        console.error("添加提供商后无法找到新提供商对象");
      }
    } else {
      console.error("添加提供商失败，未返回 ID");
      // 检查错误信息
      if (providerStore.error) {
        console.error("错误详情:", providerStore.error);
      }
    }
  } catch (error) {
    console.error("添加提供商时出错:", error);
  } finally {
    isLoading.value = false;
  }
};

// 删除提供商
const handleDeleteProvider = async () => {
  if (!selectedProvider.value) return;
  try {
    isLoading.value = true;

    // 获取该提供商关联的所有模型关联
    const modelProviderLinks = modelStore.getModelProvidersByProviderId(
      selectedProvider.value.id
    );

    // 先解除所有模型关联
    for (const link of modelProviderLinks) {
      await modelStore.unlinkModelFromProvider(link.id);
    }

    // 然后删除提供商
    const success = await providerStore.deleteProvider(
      selectedProvider.value.id
    );

    if (success) {
      selectedProvider.value = null;

      // 清理未使用的模型
      await modelStore.cleanupUnusedModels();
    }
  } catch (error) {
    console.error("删除提供商时出错:", error);
  } finally {
    isLoading.value = false;
  }
};

// 添加模型
const addModel = async () => {
  if (!selectedProvider.value || !newModelInput.value.trim()) return;

  try {
    isLoading.value = true;
    // 检查模型是否已存在
    const modelName = newModelInput.value.trim();
    let modelId: string | null = null;

    // 查找是否已有相同标识符的模型
    const existingModel = modelStore.models.find(
      (m) => m.identifier === modelName
    );

    if (existingModel) {
      modelId = existingModel.id;
    } else {
      // 创建新模型
      modelId = await modelStore.addModel(
        modelName,
        modelName,
        ModelStatus.Active
      );
    }

    if (modelId) {
      // 关联模型到提供商
      await modelStore.linkModelToProvider(modelId, selectedProvider.value.id);

      // 更新本地显示
      const modelToAdd = modelStore.models.find((m) => m.id === modelId);
      if (modelToAdd) {
        selectedProvider.value.models.push({
          id: modelToAdd.id,
          identifier: modelToAdd.identifier,
        });
      }

      // 设置模型为默认启用状态
      try {
        // 新模型已在创建时设置为活跃状态，无需额外操作
        console.log("已将新模型设置为活跃状态:", modelId);
      } catch (error) {
        console.error("设置模型状态失败:", error);
      }

      // 清空输入
      newModelInput.value = "";
    }
  } catch (error) {
    console.error("添加模型时出错:", error);
  } finally {
    isLoading.value = false;
  }
};

// 移除模型
const removeModel = async (modelId: string) => {
  if (!selectedProvider.value) return;

  try {
    isLoading.value = true;
    const model = modelStore.models.find((m) => m.id === modelId);

    if (model) {
      // 查找关联
      const link = modelStore.modelProviders.find(
        (mp) =>
          mp.modelId === model.id && mp.providerId === selectedProvider.value.id
      );

      if (link) {
        // 解除关联
        await modelStore.unlinkModelFromProvider(link.id);

        // 更新本地显示
        const modelIndex = selectedProvider.value.models.findIndex(
          (m: { id: string; identifier: string }) => m.id === modelId
        );
        if (modelIndex !== -1) {
          selectedProvider.value.models.splice(modelIndex, 1);
        }

        // 清理未使用的模型
        await modelStore.cleanupUnusedModels();
      }
    }
  } catch (error) {
    console.error("移除模型时出错:", error);
  } finally {
    isLoading.value = false;
  }
};

// 监听提供商信息变化，保存更新
const saveProviderChanges = async () => {
  if (!selectedProvider.value) return;

  try {
    isLoading.value = true;
    const result = await providerStore.updateProvider(
      selectedProvider.value.id,
      {
        name: selectedProvider.value.name,
        protocol: selectedProvider.value.protocol,
        apiKey: selectedProvider.value.api_key,
        baseUrl: selectedProvider.value.base_url,
      }
    );

    if (!result) {
      console.error("保存提供商变更失败");
    }
  } catch (error) {
    console.error("保存提供商变更时出错:", error);
  } finally {
    isLoading.value = false;
  }
};

// 监听提供商字段变化
const watchProviderChanges = () => {
  if (selectedProvider.value) {
    saveProviderChanges();
  }
};

// 监听 providers 变化，当有新提供商添加时更新界面
watch(
  providers,
  (newProviders) => {
    console.log("提供商列表已更新:", newProviders);
  },
  { deep: true }
);

// 初始化
onMounted(async () => {
  try {
    console.log("组件挂载，初始化数据...");

    // 加载提供商数据
    await providerStore.loadProviders();

    // 加载模型数据
    await modelStore.loadModels();
    await modelStore.loadAllModelProviders();

    // 如果有提供商，选择第一个
    if (providers.value.length > 0) {
      console.log("选择第一个提供商");
      selectProvider(providers.value[0]);
    } else {
      console.log("没有可用的提供商");
    }
  } catch (error) {
    console.error("初始化时出错:", error);
  }
});
</script>

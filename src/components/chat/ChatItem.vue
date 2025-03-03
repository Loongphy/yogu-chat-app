<script setup lang="ts">
import { PencilLine, Trash2, MoreHorizontal } from "lucide-vue-next";
import { ref, nextTick } from "vue";
import DropDown from "../common/DropDown.vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  chat: string;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "edit"): void;
  (e: "delete"): void;
  (e: "save", newChat: string): void;
}>();

const isEditing = ref(false);
const editValue = ref("");
const inputRef = ref<HTMLInputElement>();
const isDropdownOpen = ref(false);

const { t } = useI18n();

const startEdit = async () => {
  editValue.value = props.chat;
  isEditing.value = true;
  isDropdownOpen.value = false;
  await nextTick();
  inputRef.value?.focus();
};

const handleSave = () => {
  if (editValue.value.trim()) {
    emit("save", editValue.value.trim());
    isEditing.value = false;
  }
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSave();
  } else if (e.key === "Escape") {
    handleCancel();
  }
};
</script>

<template>
  <div
    class="group inline-flex items-center gap-2 px-2 w-full rounded-lg"
    :class="[
      isSelected
        ? 'bg-[#EBECF0] dark:bg-[#35373C]'
        : 'bg-transparent dark:bg-transparent hover:bg-[#EBECF0] dark:hover:bg-[#35373C]',
    ]"
  >
    <div class="flex-1 min-w-0 flex items-center">
      <template v-if="!isEditing">
        <button
          @click="$emit('select')"
          class="flex-1 min-w-0 inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default h-10 rounded-lg py-2 px-2 transition-all duration-150"
        >
          <span class="truncate">{{ chat }}</span>
        </button>
      </template>
      <template v-else>
        <input
          type="text"
          v-model="editValue"
          @keydown="handleKeyDown"
          @blur="handleSave"
          ref="inputRef"
          class="flex-1 min-w-0 h-10 text-sm font-medium leading-[normal] bg-transparent dark:bg-transparent px-2 rounded-lg focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          :placeholder="chat"
          autofocus
        />
      </template>
    </div>

    <div
      v-if="!isEditing"
      class="flex-shrink-0 items-center hidden group-hover:flex transition-all"
    >
      <DropDown v-model="isDropdownOpen" placement="bottom-end">
        <template #trigger>
          <button
            class="p-1.5 rounded-full hover:bg-[#DFE1E4] dark:hover:bg-[#45474C] transition-colors"
            :title="t('common.more')"
          >
            <MoreHorizontal class="w-4 h-4" />
          </button>
        </template>

        <div class="py-1">
          <button
            @click="startEdit"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#EBECF0] dark:hover:bg-[#35373C]"
          >
            <PencilLine class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ t("common.edit") }}</span>
          </button>
          <button
            @click="
              $emit('delete');
              isDropdownOpen = false;
            "
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#EBECF0] dark:hover:bg-[#35373C] text-red-500"
          >
            <Trash2 class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ t("common.delete") }}</span>
          </button>
        </div>
      </DropDown>
    </div>
  </div>
</template>

<style scoped></style>

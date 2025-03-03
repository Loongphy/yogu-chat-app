<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col gap-6 px-3">
    <div class="flex flex-col gap-2">
      <div class="text-sm font-medium dark:text-gray-200">
        {{ t("settings.about.version") }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t("settings.about.currentVersion", { version: "v1.0.0" }) }}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-medium dark:text-gray-200">
        {{ t("settings.about.contact") }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t("settings.about.contactDesc") }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t("settings.about.email", { email: "support@yogu.pro" }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueMarkdown } from "@crazydos/vue-markdown";
import MarkdownCodeBlock from "./MarkdownCodeBlock.vue";
import MarkdownCitationLink from "./MarkdownCitationLink.vue";
import RemarkCitation from "../../plugins/remark-citation";
import RemarkGfm from "remark-gfm";
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";
import { WebSearchResult } from "../../services/WebSearchResultService";

interface Props {
  content: string;
  citations?: WebSearchResult[];
}

const props = defineProps<Props>();

const getCodeLanguage = (classes: string[] | string | undefined): string => {
  if (!Array.isArray(classes)) return "text";
  const languageClass = classes.find((cls) => cls.startsWith("language-"));
  return languageClass ? languageClass.replace("language-", "") : "text";
};

const isCitation = (classes: string[] | string | undefined) => {
  if (Array.isArray(classes)) return false;
  return classes === "citation";
};
</script>

<template>
  <VueMarkdown
    :markdown="props.content"
    :remarkPlugins="[RemarkMath, RemarkGfm, RemarkCitation]"
    :rehypePlugins="[RehypeKatex]"
    class="max-w-none prose prose-zinc dark:prose-invert"
  >
    <template #a="{ children, class: classes, ...slotProps }">
      <MarkdownCitationLink
        v-if="isCitation(classes)"
        :children="children"
        :citations="props.citations"
        v-bind="slotProps"
      />
      <a v-else :class="classes" v-bind="slotProps">
        <Component :is="children" />
      </a>
    </template>
    <template #pre="{ children }">
      <div class="not-prose">
        <Component :is="children" />
      </div>
    </template>
    <template #block-code="{ children, class: classes, ...slotProps }">
      <MarkdownCodeBlock
        :content="slotProps.content"
        :language="getCodeLanguage(classes)"
      />
    </template>
  </VueMarkdown>
</template>

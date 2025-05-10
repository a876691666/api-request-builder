<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { createHighlighterCore } from "shiki/core";
import githubDark from "@shikijs/themes/github-dark";
import typescript from "@shikijs/langs/typescript";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const modelValue = defineModel<string>("modelValue", { default: "" });
const output = ref("<pre></pre>");
const preStyle = ref("");
const isLoading = ref(true);

// 初始化高亮器
(async () => {
  if (typeof window !== "undefined") {
    const highlighter = await createHighlighterCore({
      themes: [githubDark],
      langs: [typescript],
      engine: createJavaScriptRegexEngine(),
    });

    watch(modelValue, run, { immediate: true });

    function run(): void {
      output.value = highlighter.codeToHtml(modelValue.value, {
        lang: "typescript",
        theme: "github-dark",
        transformers: [
          {
            preprocess(code) {
              if (code.endsWith("\n")) return `${code}\n`;
            },
            pre(node) {
              this.addClassToHast(node, "vp-code");
              preStyle.value = (node.properties?.style as string) || "";
            },
          },
        ],
      });
      isLoading.value = false;
    }
  }
})();

const textAreaRef = ref<HTMLDivElement>();
const highlightContainerRef = ref<HTMLSpanElement>();

function syncScroll() {
  if (!highlightContainerRef.value || !textAreaRef.value) return;
  const preEl = highlightContainerRef.value.children[0] as HTMLPreElement;
  if (!preEl) return;
  preEl.scrollLeft = textAreaRef.value.scrollLeft;
}

function onInput() {
  nextTick().then(() => {
    syncScroll();
  });
}
</script>

<template>
  <div
    class="language-ts vp-adaptive-theme transition-none! mini-playground shadow h-full overflow-y-auto overflow-x-hidden"
    :style="[preStyle]"
  >
    <div class="relative float-left min-w-full">
      <div ref="highlightContainerRef" v-html="output" class="h-full" />
      <textarea
        ref="textAreaRef"
        v-model="modelValue"
        class="whitespace-pre p-0 border-none outline-none overflow-hidden w-full h-full font-mono bg-transparent absolute inset-0 text-transparent caret-gray tab-4 resize-none z-10 line-height-$vp-code-line-height font-$vp-font-family-mono text-size-$vp-code-font-size"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        @input="onInput"
        @scroll="syncScroll"
      />
    </div>
  </div>
</template>

<style>
.shiki {
  margin: 0;
}
.mini-playground select {
  background: transparent;
  color: inherit;
  min-width: 8em;
  padding: 0px !important;
  position: relative;
}
.mini-playground select:focus {
  outline: none;
}

.mini-playground select:before {
  content: "";
  position: absolute;
  width: 1em;
  height: 1em;
  background: red;
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { CodeJar } from "codejar";
import * as Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

const modelValue = defineModel<string>("modelValue", { default: "" });
const editorRef = ref<HTMLElement>();
let jar: CodeJar | null = null;
let isInternalUpdate = false;

// 高亮函数
const highlight = (editor: HTMLElement) => {
  const code = editor.textContent || "";
  editor.innerHTML = Prism.highlight(code, Prism.languages.javascript, "javascript");
};

onMounted(() => {
  if (editorRef.value) {
    jar = CodeJar(editorRef.value, highlight, {
      tab: "  ",
      indentOn: /[({[]$/,
      catchTab: true,
      preserveIdent: true,
      addClosing: true,
      history: true,
    });

    // 设置初始值
    jar.updateCode(modelValue.value);

    // 监听编辑器变化
    jar.onUpdate((code) => {
      if (code !== modelValue.value) {
        isInternalUpdate = true;
        modelValue.value = code;
      }
    });
  }
});

// 监听外部值变化
watch(modelValue, (newValue) => {
  if (isInternalUpdate) {
    isInternalUpdate = false;
    return;
  }
  if (jar && newValue !== jar.toString()) {
    jar.updateCode(newValue);
  }
});

onUnmounted(() => {
  jar?.destroy();
  jar = null;
});
</script>

<template>
  <div class="mini-playground shadow h-full overflow-auto">
    <pre
      ref="editorRef"
      class="code-editor language-javascript"
      style="margin: 0"
    ><code>{{ modelValue }}</code></pre>
  </div>
</template>

<style>
.code-editor {
  margin: 0;
  padding: 12px;
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  font-size: 14px;
  line-height: 1.5;
  background: #1d1f21;
  color: #c5c8c6;
  border-radius: 4px;
  min-height: 100%;
  box-sizing: border-box;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.code-editor:focus {
  outline: none;
}

.mini-playground {
  background: #1d1f21;
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
</style>

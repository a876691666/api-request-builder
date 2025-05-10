<template>
  <div class="w-full h-full data-transform-container">
    <div class="monaco-editor-container">
      <CodeEditor v-model="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { CodeEditor } from "../CodeEditor";

const modelValue = defineModel<string>();

onMounted(() => {
  if (!modelValue.value) {
    modelValue.value = "function transformData(data) {\n  return data\n}";
  }
});
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: calc(100% - 32px);
}

.data-transform-container {
  color: #fff;
  font-family: Consolas, "Courier New", monospace;
  font-size: 14px;
}

.function-container {
  line-height: 16px;
  background: var(--vscode-editor-background);
}

.function-name {
  color: #569cd6;
}

.yellow {
  color: #ffd700;
}
</style>

<template>
  <div class="w-400px h-400px data-transform-container">
    <div class="function-container monaco-component">
      <span class="function-name">function</span> transformData<span class="yellow">(</span
      >data<span class="yellow">) {</span>
    </div>
    <div ref="editorContainer" class="monaco-editor-container"></div>
    <div class="function-container monaco-component yellow">}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

const modelValue = defineModel<string>();
const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 处理函数包装
const functionPrefix = "function transformData(data) {";
const functionSuffix = "}";

// 从完整代码提取编辑器内容
const getEditorContent = (fullCode: string) => {
  if (!fullCode) return "return data";

  if (fullCode.startsWith(functionPrefix) && fullCode.endsWith(functionSuffix)) {
    return fullCode
      .substring(functionPrefix.length, fullCode.length - functionSuffix.length)
      .trim();
  }

  return fullCode;
};

// 将编辑器内容包装成完整函数
const getFullCode = (editorContent: string) => {
  const indentedContent = editorContent
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `${functionPrefix}\n${indentedContent}\n${functionSuffix}`;
};

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

onMounted(() => {
  if (!modelValue.value) {
    modelValue.value = "function transformData(data) {\n  return data\n}";
  }
  const initialContent = getEditorContent(modelValue.value as string) || "return data";

  editor = monaco.editor.create(editorContainer.value as HTMLElement, {
    value: initialContent,
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    glyphMargin: false,
    folding: false,
    lineNumbers: "off",
    lineDecorationsWidth: 14,
    lineNumbersMinChars: 0,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    tabSize: 2,
    insertSpaces: true,
  });

  // 监听编辑器内容变化
  editor.onDidChangeModelContent(() => {
    const editorContent = editor?.getValue();
    modelValue.value = getFullCode(editorContent || "");
  });
});

// 监听v-model变化，更新编辑器内容
watch(modelValue, (newValue) => {
  if (editor) {
    const editorContent = getEditorContent(newValue as string);
    const currentContent = editor.getValue();

    // 只有当外部值真正改变时才更新编辑器
    if (editorContent !== currentContent && !editor.hasTextFocus()) {
      editor.setValue(editorContent);
    }
  }
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 300px;
}

.data-transform-container {
  color: #fff;
  font-weight: 600;
  font-family: Consolas, "Courier New", monospace;
  font-size: 14px;
}

.function-container {
  background: var(--vscode-editor-background);
}

.function-name {
  color: #569cd6;
}

.yellow {
  color: #ffd700;
}
</style>

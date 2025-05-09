<script setup lang="ts">
import { ref, watch } from "vue";
import {
  DataTransform,
  RequestForm,
  ResponseSection,
  type RequestSchema,
  defaultRequestSchema,
} from "../lib";

const requestSchema = ref<RequestSchema>(defaultRequestSchema);
const previewContent = ref(JSON.stringify(requestSchema.value, null, 2));

const handleSchemaChange = (newSchema: RequestSchema) => {
  console.log("Schema changed:", newSchema);
  previewContent.value = JSON.stringify(newSchema, null, 2);
};

const handlePreviewChange = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  try {
    const newSchema = JSON.parse(textarea.value);
    requestSchema.value = newSchema;
  } catch (error) {
    // Invalid JSON, just update the preview content without changing the schema
    previewContent.value = textarea.value;
  }
};

// Watch for schema changes from the form to update preview
watch(
  requestSchema,
  (newSchema) => {
    previewContent.value = JSON.stringify(newSchema, null, 2);
  },
  { deep: true }
);

const transformFunctionString = ref("");
</script>

<template>
  <div class="flex w-full h-full justify-center items-center gap-4 py-10">
    <RequestForm
      class="w-360px min-w-360px"
      v-model="requestSchema"
      @update:modelValue="handleSchemaChange"
    />

    <div class="text-sm text-center nowrap">
      转换 >
      <br />
      {{`<RequestForm v-model="schame" />`}}
    </div>

    <div class="w-360px min-w-360px">
      <textarea
        v-model="previewContent"
        @input="handlePreviewChange"
        class="preview-textarea"
        spellcheck="false"
      ></textarea>
    </div>

    <div class="text-sm text-center nowrap">
      调用 >
      <br />
      executeRequest(schame.value)
    </div>

    <ResponseSection class="w-360px min-w-360px" v-model="requestSchema" />
  </div>
  <DataTransform v-model="transformFunctionString" />

  <pre>{{ transformFunctionString }}</pre>
</template>

<style scoped>
.app-container {
  max-width: 360px;
  margin: 0 auto;
  padding: 10px;
}

.preview-container {
  margin-bottom: 10px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-textarea {
  width: 100%;
  min-height: 300px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.2;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  background-color: #fff;
  tab-size: 2;
}

.preview-textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style>

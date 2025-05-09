<script setup lang="ts">
import { ref, watch } from "vue";
import {
  DataTransform,
  RequestForm,
  ResponseSection,
  type RequestSchema,
  defaultRequestSchema,
  executeTransformFunction,
} from "vue-api-request-builder";
import "vue-api-request-builder/dist/index.css";

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

const transformFunctionString = ref(`function transformData(data) {
return data.results.map(item => item.name); 
}`);

// 示例数据
const sampleData = ref({
  results: [
    { id: 1, name: "项目1", description: "这是第一个项目的详细描述", status: "active" },
    { id: 2, name: "项目2", description: "这是第二个项目的详细描述", status: "pending" },
    { id: 3, name: "项目3", description: "这是第三个项目的详细描述", status: "completed" },
  ],
  pagination: {
    total: 3,
    page: 1,
    pageSize: 10,
  },
});

// 存储转换后的数据
const transformedData = ref(null);

// 应用转换函数
const applyTransform = () => {
  transformedData.value = executeTransformFunction(transformFunctionString.value, sampleData.value);
};
</script>

<template>
  <div
    class="flex w-full h-full justify-center items-center gap-4 py-10 flex-wrap p-4 overflow-auto"
  >
    <div class="w-360px min-w-360px">
      <div class="text-sm text-center nowrap">1. 配置</div>
      <RequestForm v-model="requestSchema" @update:modelValue="handleSchemaChange" />
    </div>

    <div class="w-360px min-w-360px">
      <div class="text-sm text-center nowrap">
        2. 转换
        <br />
        {{`<RequestForm v-model="schame" />`}}
      </div>
      <textarea
        v-model="previewContent"
        @input="handlePreviewChange"
        class="preview-textarea"
        spellcheck="false"
      ></textarea>
    </div>

    <div class="w-360px min-w-360px">
      <div class="text-sm text-center nowrap">
        3. 调用
        <br />
        data = executeRequest(schame.value)
      </div>
      <ResponseSection v-model="requestSchema" />
    </div>

    <div class="w-360px min-w-360px">
      <div class="text-sm text-center nowrap">
        4. 配置数据转换函数
        <br />
        {{ `<DataTransform v-model="transformFunctionString" />` }}
      </div>

      <div class="w-full h-200px">
        <DataTransform v-model="transformFunctionString" />
      </div>
    </div>

    <div class="w-360px min-w-360px">
      <div class="text-sm text-center nowrap">
        5. 调用转换数据
        <br />
        <p class="whitespace-nowrap">executeTransformFunction(transformFunctionString, data)</p>
      </div>

      <div class="w-full h-200px">
        <div class="card-container">
          <div class="card-title">数据转换示例</div>
          <div class="card-content">
            <button @click="applyTransform" class="transform-btn mb-4">转换</button>
            <div class="flex justify-between">
              <div class="w-1/2 pr-2">
                <div class="section-title">模拟数据：</div>
                <div class="code-container h-200px">
                  <pre>{{ JSON.stringify(sampleData, null, 2) }}</pre>
                </div>
              </div>
              <div class="w-1/2 pl-2">
                <div class="section-title">转换后数据：</div>
                <div class="code-container h-200px">
                  <pre>{{
                    transformedData ? JSON.stringify(transformedData, null, 2) : "暂无转换数据"
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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

/* 数据转换函数示例区域的样式 */
.card-container {
  border: 1px solid #f0f0f0;
  border-radius: 2px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 14px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.65);
}

.card-title {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 6px;
}

.section-title {
  color: rgba(0, 0, 0, 0.85);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
}

.card-content {
  position: relative;
  margin-bottom: 10px;
}

.code-container {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  padding: 8px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
  overflow: auto;
}

.transform-btn {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
  padding: 0 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  height: 26px;
  line-height: 26px;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  touch-action: manipulation;
  border: 1px solid transparent;
  outline: none;
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
  display: inline-block;
}

.transform-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.transform-btn:active {
  background-color: #096dd9;
  border-color: #096dd9;
}

.tip-container {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 2px;
  padding: 8px 10px;
  position: relative;
}

.tip-title {
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 12px;
}

.tip-content {
  margin: 0;
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  line-height: 1.5;
}

.inline-code {
  background-color: #f5f5f5;
  padding: 1px 3px;
  border-radius: 2px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 11px;
  border: 1px solid #eee;
}
</style>
<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>

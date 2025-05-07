<template>
  <div class="request-form">
    <a-form layout="vertical">
      <!-- 请求部分 -->
      <a-card title="请求" class="form-section" size="small">
        <a-space>
          <a-select v-model:value="method" style="width: 100px" size="small">
            <a-select-option value="GET">GET</a-select-option>
            <a-select-option value="POST">POST</a-select-option>
            <a-select-option value="PUT">PUT</a-select-option>
            <a-select-option value="DELETE">DELETE</a-select-option>
            <a-select-option value="OPTIONS">OPTIONS</a-select-option>
          </a-select>
          <a-input v-model:value="url" placeholder="基础URL" style="width: 100%" size="small" />
          <a-input v-model:value="path" placeholder="路径" style="width: 200px" size="small" />
        </a-space>
      </a-card>

      <!-- 请求参数部分 -->
      <a-card title="URL参数拼接" class="form-section" size="small">
        <KeyValueInput
          v-model="params"
          add-button-text="添加参数"
          :show-preview="true"
          :preview-text="url + path + queryString"
        />
      </a-card>

      <!-- 认证部分 -->
      <a-card title="认证" class="form-section" size="small">
        <a-form-item label="认证类型">
          <a-select v-model:value="auth" style="width: 100%" size="small">
            <a-select-option value="none">无</a-select-option>
            <a-select-option value="Basic">Basic认证</a-select-option>
          </a-select>
        </a-form-item>

        <template v-if="auth === 'Basic'">
          <a-form-item label="用户名">
            <a-input v-model:value="httpUser" size="small" />
          </a-form-item>
          <a-form-item label="密码">
            <a-input-password v-model:value="httpPassword" size="small" />
          </a-form-item>
        </template>
      </a-card>

      <!-- 请求头部分 -->
      <a-card title="请求头" class="form-section" size="small">
        <KeyValueInput v-model="headers" add-button-text="添加请求头" :show-preview="false" />
      </a-card>

      <!-- 请求体部分 -->
      <a-card
        v-if="method === 'POST' || method === 'PUT'"
        title="请求体"
        class="form-section"
        size="small"
      >
        <a-form-item label="内容类型">
          <a-radio-group v-model:value="contentType" button-style="solid" size="small">
            <a-radio-button value="application/json">JSON</a-radio-button>
            <a-radio-button value="multipart/form-data">Form Data</a-radio-button>
            <a-radio-button value="text/plain">Raw</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- JSON 输入 -->
        <template v-if="contentType === 'application/json'">
          <a-form-item label="JSON 数据">
            <a-textarea
              v-model:value="jsonBody"
              :rows="6"
              placeholder="请输入 JSON 数据"
              @input="handleJsonInput"
            />
          </a-form-item>
          <a-alert
            v-if="jsonError"
            type="error"
            :message="jsonError"
            banner
            style="margin-bottom: 8px"
          />
        </template>

        <!-- Form Data 输入 -->
        <template v-if="contentType === 'multipart/form-data'">
          <KeyValueInput
            v-model="bodyParams"
            add-button-text="添加表单字段"
            :show-preview="false"
          />
        </template>

        <!-- Raw 输入 -->
        <template v-if="contentType === 'text/plain'">
          <a-form-item label="原始数据">
            <a-textarea v-model:value="rawBody" :rows="6" placeholder="请输入原始数据" />
          </a-form-item>
        </template>

        <!-- 预览部分 -->
        <a-form-item label="预览">
          <pre>{{ requestBodyPreview }}</pre>
        </a-form-item>
      </a-card>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import KeyValueInput from "./KeyValueInput.vue";
import type { RequestSchema, KeyValuePair } from "../types/request";
import { defaultRequestSchema } from "../types/request";

interface Props {
  modelValue?: RequestSchema;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => defaultRequestSchema,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: RequestSchema): void;
}>();

// 响应式状态
const method = ref(props.modelValue.method);
const url = ref(props.modelValue.url);
const auth = ref(props.modelValue.auth.type);
const path = ref(props.modelValue.path);
const httpUser = ref(props.modelValue.auth.username || "");
const httpPassword = ref(props.modelValue.auth.password || "");
const params = ref<KeyValuePair[]>(props.modelValue.params);
const headers = ref<KeyValuePair[]>(props.modelValue.headers);
const bodyParams = ref<KeyValuePair[]>(props.modelValue.body.formData || []);
const contentType = ref(props.modelValue.body.type);
const jsonBody = ref(props.modelValue.body.json || "");
const rawBody = ref(props.modelValue.body.raw || "");
const jsonError = ref("");

// 创建一个防抖函数
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 创建一个更新schema的函数
const updateSchema = debounce(() => {
  const schema: RequestSchema = {
    method: method.value,
    url: url.value,
    path: path.value,
    auth: {
      type: auth.value,
      ...(auth.value === "Basic"
        ? {
            username: httpUser.value,
            password: httpPassword.value,
          }
        : {}),
    },
    params: params.value,
    headers: headers.value,
    body: {
      type: contentType.value,
      ...(contentType.value === "application/json"
        ? { json: jsonBody.value }
        : contentType.value === "multipart/form-data"
        ? { formData: bodyParams.value }
        : { raw: rawBody.value }),
    },
  };
  emit("update:modelValue", schema);
}, 100);

// 监听内部状态变化
watch(
  [
    method,
    url,
    path,
    auth,
    httpUser,
    httpPassword,
    params,
    headers,
    contentType,
    bodyParams,
    jsonBody,
    rawBody,
  ],
  () => {
    updateSchema();
  },
  { deep: true }
);

// 监听外部变化
watch(
  () => props.modelValue,
  (newValue) => {
    // 防止循环更新
    if (
      JSON.stringify(newValue) ===
      JSON.stringify({
        method: method.value,
        url: url.value,
        path: path.value,
        auth: {
          type: auth.value,
          ...(auth.value === "Basic"
            ? {
                username: httpUser.value,
                password: httpPassword.value,
              }
            : {}),
        },
        params: params.value,
        headers: headers.value,
        body: {
          type: contentType.value,
          ...(contentType.value === "application/json"
            ? { json: jsonBody.value }
            : contentType.value === "multipart/form-data"
            ? { formData: bodyParams.value }
            : { raw: rawBody.value }),
        },
      })
    ) {
      return;
    }

    method.value = newValue.method;
    url.value = newValue.url;
    path.value = newValue.path;
    auth.value = newValue.auth.type;
    httpUser.value = newValue.auth.username || "";
    httpPassword.value = newValue.auth.password || "";
    params.value = newValue.params;
    headers.value = newValue.headers;
    contentType.value = newValue.body.type;
    bodyParams.value = newValue.body.formData || [];
    jsonBody.value = newValue.body.json || "";
    rawBody.value = newValue.body.raw || "";
  },
  { deep: true }
);

// 计算属性
const queryString = computed(() => {
  const result = params.value
    .filter((p) => !!p.key)
    .map((p) => p.key + "=" + encodeURIComponent(p.value))
    .join("&");
  return result === "" ? "" : "?" + result;
});

const requestBodyPreview = computed(() => {
  switch (contentType.value) {
    case "application/json":
      try {
        return JSON.stringify(JSON.parse(jsonBody.value), null, 2);
      } catch (e) {
        return "Invalid JSON";
      }
    case "multipart/form-data":
      const boundary = "----WebKitFormBoundaryPreview";
      const formData = bodyParams.value
        .filter((p) => !!p.key)
        .map(
          (p) =>
            `--${boundary}\r\nContent-Disposition: form-data; name="${p.key}"\r\n\r\n${p.value}\r\n`
        )
        .join("");
      return formData + `--${boundary}--\r\n`;
    case "text/plain":
      return rawBody.value;
    default:
      return "";
  }
});

const handleJsonInput = () => {
  try {
    if (jsonBody.value) {
      JSON.parse(jsonBody.value);
      jsonError.value = "";
    }
  } catch (e) {
    jsonError.value = "Invalid JSON format";
  }
};
</script>

<style scoped>
.request-form {
  width: 100%;
  margin: 0 auto;
  padding: 0px;
}

.form-section {
  margin-bottom: 8px;
  width: 100%;
}

:deep(.ant-card-head) {
  background-color: #fafafa;
}

:deep(.ant-card-head-title) {
  font-weight: 500;
  padding: 4px 0;
}

:deep(.ant-card-body) {
  padding: 8px 12px;
}

:deep(.ant-space) {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
}

:deep(.ant-space-item) {
  flex: 1;
}

:deep(.ant-space-item:first-child) {
  flex: 0 0 100px;
}

:deep(.ant-space-item:nth-child(3)) {
  flex: 0 0 200px;
}

:deep(.ant-space-item:last-child) {
  flex: 0 0 80px;
}

:deep(.ant-list-item) {
  padding: 4px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 8px;
}

pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  width: 100%;
  overflow-x: auto;
}
</style>

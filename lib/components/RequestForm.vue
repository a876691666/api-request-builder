<template>
  <div class="request-form">
    <a-form layout="vertical">
      <!-- 请求部分 -->
      <a-card title="URL配置" class="form-section" size="small">
        <div class="flex flex-col gap-1">
          <div class="flex flex-row gap-1">
            <a-input v-model:value="url" placeholder="基础URL" size="small" />
            <a-button v-if="canParseUrl" type="primary" size="small" @click="parseUrl"
              >拆解</a-button
            >
          </div>
          <div class="flex flex-row gap-1">
            <a-select v-model:value="method" class="w-40" size="small">
              <a-select-option value="GET">GET</a-select-option>
              <a-select-option value="POST">POST</a-select-option>
              <a-select-option value="PUT">PUT</a-select-option>
              <a-select-option value="DELETE">DELETE</a-select-option>
              <a-select-option value="OPTIONS">OPTIONS</a-select-option>
            </a-select>
            <a-input v-model:value="path" placeholder="路径" size="small" />
          </div>
        </div>

        <!-- URL参数拼接部分 -->
        <div class="mt-1">
          <KeyValueInput
            v-model="params"
            add-button-text="添加参数"
            :show-preview="true"
            :preview-text="url + path + queryString"
          />
        </div>
      </a-card>

      <!-- 认证部分 -->
      <a-card title="认证方案" class="form-section" size="small">
        <a-radio-group v-model:value="auth" button-style="solid" size="small">
          <a-radio-button value="none">无认证</a-radio-button>
          <a-radio-button value="Basic">Basic认证</a-radio-button>
          <a-radio-button value="Bearer">Bearer认证</a-radio-button>
        </a-radio-group>

        <template v-if="auth === 'Basic'">
          <div class="flex flex-col gap-1 mt-2">
            <div class="flex flex-row gap-1 h-6">
              <p class="m-0 w-16">用户名</p>
              <a-input v-model:value="httpUser" size="small" />
            </div>
            <div class="flex flex-row gap-1">
              <p class="m-0 w-16">密码</p>
              <a-input-password v-model:value="httpPassword" size="small" />
            </div>
          </div>
        </template>
        <template v-if="auth === 'Bearer'">
          <div class="flex flex-col gap-1 mt-1">
            <div class="flex flex-row gap-1 items-center">
              <p class="m-0 w-16 h-full">Token</p>
              <a-textarea
                v-model:value="httpToken"
                size="small"
                class="mt-1"
                rows="4"
                placeholder="请输入Token"
              />
            </div>
          </div>
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
        <a-radio-group v-model:value="contentType" button-style="solid" size="small" class="mb-1">
          <a-radio-button value="application/json">JSON</a-radio-button>
          <a-radio-button value="multipart/form-data">Form Data</a-radio-button>
          <a-radio-button value="text/plain">Raw</a-radio-button>
        </a-radio-group>

        <!-- JSON 输入 -->
        <template v-if="contentType === 'application/json'">
          <a-textarea
            v-model:value="jsonBody"
            :rows="6"
            placeholder="请输入 JSON 数据"
            @input="handleJsonInput"
          />
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
          <a-textarea v-model:value="rawBody" :rows="6" placeholder="请输入原始数据" />
        </template>

        <!-- 预览部分 -->
        <pre>{{ requestBodyPreview }}</pre>
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
const httpToken = ref(props.modelValue.auth.token || "");
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

// 创建一个生成schema的函数
const generateSchema = () => {
  return {
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
        : auth.value === "Bearer"
        ? {
            token: httpToken.value,
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
};

// 创建一个更新schema的函数
const updateSchema = debounce(() => {
  emit("update:modelValue", generateSchema());
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
    httpToken,
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
    const currentSchema = generateSchema();
    // 防止循环更新
    if (JSON.stringify(newValue) === JSON.stringify(currentSchema)) {
      return;
    }

    method.value = newValue.method;
    url.value = newValue.url;
    path.value = newValue.path;
    auth.value = newValue.auth.type;
    httpUser.value = newValue.auth.username || "";
    httpPassword.value = newValue.auth.password || "";
    httpToken.value = newValue.auth.token || "";
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
        if (!jsonBody.value) {
          return "-空-";
        }
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
      return rawBody.value || "-空-";
    default:
      return "-空-";
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

const parseUrl = () => {
  try {
    const fullUrl = url.value;
    const urlObj = new URL(fullUrl);

    // 设置基础URL
    url.value = `${urlObj.protocol}//${urlObj.host}`;

    // 设置路径
    path.value = urlObj.pathname;

    // 解析查询参数
    const searchParams = new URLSearchParams(urlObj.search);
    const newParams: KeyValuePair[] = [];
    searchParams.forEach((value, key) => {
      newParams.push({ key, value });
    });
    params.value = newParams;
  } catch (error) {
    // 如果URL解析失败，显示错误提示
    console.error("URL解析失败:", error);
  }
};

const canParseUrl = computed(() => {
  if (!url.value) return false;

  try {
    const fullUrl = url.value;
    const urlObj = new URL(fullUrl);

    // 检查是否有查询参数或路径
    return urlObj.search !== "" || urlObj.pathname !== "/";
  } catch {
    return false;
  }
});
</script>

<style scoped>
.request-form {
  margin: 0;
  padding: 0px;
}

.request-form * {
  font-size: 0.9rem;
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

pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  width: 100%;
  overflow-x: auto;
}
</style>

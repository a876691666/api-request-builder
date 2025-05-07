<template>
  <a-card title="响应" class="form-section" size="small">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
      <a-radio-group v-model:value="requestMethod" button-style="solid" size="small">
        <a-radio-button value="xhr">XMLHttpRequest</a-radio-button>
        <a-radio-button value="fetch">Fetch</a-radio-button>
      </a-radio-group>
      <a-button type="primary" @click="sendRequest" size="small">发送</a-button>
    </div>

    <a-alert
      v-if="errorMessage"
      :message="errorMessage"
      type="error"
      show-icon
      style="margin-bottom: 8px"
    />

    <div class="response-section">
      <div class="section-title">基本信息</div>
      <a-descriptions>
        <a-descriptions-item label="状态码">
          <a-tag :color="getStatusColor(response.status)">
            {{ response.status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="耗时">
          {{ response.timing ? `${response.timing}ms` : '-' }}
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <div class="response-section">
      <div class="section-title">响应头</div>
      <template v-if="Object.keys(response.headers).length > 0">
        <a-table
          :columns="[
            { title: '响应头', dataIndex: 'key', width: '30%' },
            { title: '值', dataIndex: 'value' },
          ]"
          :data-source="Object.entries(response.headers).map(([key, value]) => ({ key, value }))"
          :pagination="false"
          size="small"
        />
      </template>
      <p v-else>无响应头</p>
    </div>

    <div class="response-section">
      <div class="section-title">响应体</div>
      <a-textarea
        v-model:value="response.body"
        :rows="5"
        readonly
        style="width: 100%"
        size="small"
      />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { RequestSchema, ResponseData } from "../types/request";
import { executeRequest, type RequestMethod } from "../utils/request";

interface Props {
  modelValue: RequestSchema;
}

const props = defineProps<Props>();

const requestMethod = ref<RequestMethod>("xhr");
const response = ref<ResponseData>({
  status: "",
  headers: {},
  body: "",
  timing: 0,
});
const errorMessage = ref<string>("");

const getStatusColor = (status: string | number): string => {
  const statusNum = Number(status);
  if (statusNum >= 200 && statusNum < 300) return 'success';
  if (statusNum >= 300 && statusNum < 400) return 'warning';
  if (statusNum >= 400 && statusNum < 500) return 'error';
  if (statusNum >= 500) return 'error';
  return 'default';
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 处理跨域错误
    if (message.includes('cors') || message.includes('cross-origin')) {
      return '跨域请求被阻止。可能的原因：\n' +
             '1. 目标服务器未设置正确的 CORS 响应头\n' +
             '2. 请求的域名不在允许列表中\n' +
             '3. 请求方法或请求头不被允许\n\n' +
             '建议：\n' +
             '1. 检查目标服务器的 CORS 配置\n' +
             '2. 确保请求的域名在服务器的允许列表中\n' +
             '3. 如果是开发环境，可以考虑使用代理服务器';
    }
    
    // 处理网络错误
    if (message.includes('network') || message.includes('failed to fetch')) {
      return '网络请求失败。可能的原因：\n' +
             '1. 网络连接不稳定\n' +
             '2. 目标服务器未响应\n' +
             '3. 请求超时';
    }

    return error.message;
  }
  return "请求失败";
};

const sendRequest = async () => {
  errorMessage.value = "";
  const startTime = Date.now();
  try {
    response.value = await executeRequest(props.modelValue, requestMethod.value);
    response.value.timing = Date.now() - startTime;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    response.value = {
      status: "Error",
      headers: {},
      body: error instanceof Error ? error.message : "Request failed",
      timing: Date.now() - startTime,
    };
  }
};
</script>

<style scoped>
.form-section {
  margin-bottom: 8px;
  width: 100%;
}

.response-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
  margin-bottom: 8px;
  padding-left: 4px;
  border-left: 3px solid #1890ff;
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

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}
</style> 
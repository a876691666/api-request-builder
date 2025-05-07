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

    <div class="flex flex-col gap-2">
      <div class="text-sm font-bold">基本信息</div>
      <div class="flex flex-col gap-1">
        <div>
          <span>状态码:</span>
          <a-tag :color="getStatusColor(response.status)">{{ response.status }}</a-tag>
        </div>
        <div>
          <span>耗时:</span>
          <span>{{ response.timing ? `${response.timing}ms` : "-" }}</span>
        </div>
      </div>
      <div class="text-sm font-bold">响应头</div>
      <template v-if="Object.keys(response.headers).length > 0">
        <table class="border border-solid border-gray-300 w-full">
          <tbody>
            <tr v-for="[key, value] in Object.entries(response.headers)" :key="key">
              <td class="border border-gray-300">{{ key }}</td>
              <td class="border border-gray-300">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <p v-else>无响应头</p>
      <div class="text-sm font-bold">响应体</div>
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
  if (statusNum >= 200 && statusNum < 300) return "success";
  if (statusNum >= 300 && statusNum < 400) return "warning";
  if (statusNum >= 400 && statusNum < 500) return "error";
  if (statusNum >= 500) return "error";
  return "default";
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
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

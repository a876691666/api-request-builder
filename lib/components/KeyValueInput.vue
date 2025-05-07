<template>
  <div class="key-value-input flex flex-col gap-1">
    <div class="flex gap-2">
      <a-button type="primary" @click="addItem" class="w-40 max-w-full" size="small">
        {{ addButtonText }}
      </a-button>
      <a-popconfirm
        title="确认清空"
        description="确定要清空所有参数吗？"
        ok-text="确认"
        cancel-text="取消"
        @confirm="clearItems"
      >
        <a-button type="primary" danger class="w-40 max-w-full" size="small" :disabled="items.length === 0">
          清空
        </a-button>
      </a-popconfirm>
    </div>

    <template v-if="items.length > 0">
      <div class="flex flex-col gap-1">
        <div v-for="(item, index) in items" :key="index" class="flex">
          <div class="flex w-full gap-1 items-center">
            <a-button type="primary" danger @click="removeItem(index)" class="w-16" size="small">
              删除
            </a-button>
            <a-input v-model:value="item.key" placeholder="键" style="width: 60%" size="small" />
            <a-input v-model:value="item.value" placeholder="值" style="width: 100%" size="small" />
          </div>
        </div>
      </div>
    </template>

    <a-typography v-if="showPreview" class="m-0">
      <a-typography-paragraph class="!m-0">
        <pre>{{ previewText }}</pre>
      </a-typography-paragraph>
    </a-typography>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface KeyValueItem {
  key: string;
  value: string;
}

interface Props {
  modelValue: KeyValueItem[];
  addButtonText?: string;
  showPreview?: boolean;
  previewText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  addButtonText: "添加参数",
  showPreview: false,
  previewText: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: KeyValueItem[]): void;
}>();

const items = ref<KeyValueItem[]>(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    items.value = newValue;
  }
);

watch(
  items,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

const addItem = () => {
  items.value.push({ key: "", value: "" });
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const clearItems = () => {
  items.value = [];
};
</script>

<style scoped>
.key-value-input {
  width: 100%;
}

.empty-state {
  color: #999;
  text-align: center;
  padding: 8px 0;
}

.key-value-input :deep(.ant-typography pre) {
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  margin: 0;
  width: 100%;
  overflow-x: auto;
}

.key-value-input :deep(.ant-space-item) {
  flex: 1;
}

.key-value-input :deep(.ant-space-item:first-child) {
  flex: 0 0 100px;
}

.key-value-input :deep(.ant-space-item:nth-child(2)) {
  flex: 0 0 200px;
}

.key-value-input :deep(.ant-list-item) {
  padding: 4px 0;
}

:deep(.ant-typography pre) {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  width: 100%;
  overflow-x: auto;
  max-height: 60px;
  font-size: 12px;
  line-height: 1.5;
}
</style>

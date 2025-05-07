<template>
  <div class="key-value-input">
    <a-button type="primary" @click="addItem" style="width: 100%; margin-bottom: 8px" size="small">
      {{ addButtonText }}
    </a-button>

    <template v-if="items.length > 0">
      <a-list :data-source="items" :bordered="false" size="small" style="margin-bottom: 8px">
        <template #renderItem="{ item, index }">
          <a-list-item style="padding: 4px 0">
            <a-space style="width: 100%">
              <a-input v-model:value="item.key" placeholder="键" style="width: 100%" size="small" />
              <a-input
                v-model:value="item.value"
                placeholder="值"
                style="width: 100%"
                size="small"
              />
              <a-button
                type="primary"
                danger
                @click="removeItem(index)"
                style="width: 80px"
                size="small"
                >删除</a-button
              >
            </a-space>
          </a-list-item>
        </template>
      </a-list>
    </template>
    <template v-else>
      <div class="empty-state">未设置</div>
    </template>

    <a-typography v-if="showPreview">
      <a-typography-paragraph>
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
</script>

<style scoped>
.key-value-input {
  width: 100%;
}

.empty-state {
  color: #999;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
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

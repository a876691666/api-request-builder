<script setup lang="ts">
import { ref } from 'vue';
import RequestForm from "./components/RequestForm.vue";
import type { RequestSchema } from "./types/request";
import { defaultRequestSchema } from "./types/request";

const requestSchema = ref<RequestSchema>(defaultRequestSchema);

const handleSchemaChange = (newSchema: RequestSchema) => {
  console.log('Schema changed:', newSchema);
};
</script>

<template>
  <div class="app-container">
    <RequestForm v-model="requestSchema" @update:modelValue="handleSchemaChange" />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>

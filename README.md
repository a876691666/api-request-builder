# API Request Builder

A Vue 3 component for building and testing API requests with a beautiful UI.

## Installation

```bash
npm install api-request-builder
# or
yarn add api-request-builder
# or
pnpm add api-request-builder
```

## Usage

### Basic Usage

```vue
<template>
  <RequestForm v-model="requestSchema" @update:modelValue="handleSchemaChange" />
  <ResponseSection v-model="requestSchema" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RequestForm, ResponseSection, type RequestSchema, defaultRequestSchema } from 'api-request-builder';

const requestSchema = ref<RequestSchema>(defaultRequestSchema);

const handleSchemaChange = (newSchema: RequestSchema) => {
  console.log("Schema changed:", newSchema);
};
</script>
```

### Advanced Usage with Preview

```vue
<template>
  <div class="app-container">
    <div class="preview-container">
      <textarea
        v-model="previewContent"
        @input="handlePreviewChange"
        class="preview-textarea"
        spellcheck="false"
      ></textarea>
    </div>

    <RequestForm v-model="requestSchema" @update:modelValue="handleSchemaChange" />
    <ResponseSection v-model="requestSchema" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RequestForm, ResponseSection, type RequestSchema, defaultRequestSchema } from 'api-request-builder';

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
</script>
```

## Components

### RequestForm

The main component for building API requests. It provides a form interface for configuring:
- HTTP method selection
- URL input
- URL parameters
- Headers
- Authentication
- Request body

### ResponseSection

Displays the response from the API request, including:
- Status code
- Response headers
- Response body
- Response time

## Features

- Support for GET, POST, PUT, DELETE, and OPTIONS methods
- URL parameters management
- Basic authentication
- Custom headers
- Request body support for:
  - JSON
  - Form Data
  - Raw text
- Response preview with status, headers, and body
- Beautiful UI using Ant Design Vue
- Live preview of request schema
- Two-way binding with v-model
- Schema change events

## Dependencies

This package requires:
- Vue 3.x
- Ant Design Vue 4.x

## License

MIT

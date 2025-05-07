# API Request Builder

A Vue 3 component for building and testing API requests with a beautiful UI.

# Start of Selection
[中文文档](README_zh.md)

## Installation

```bash
npm install vue-api-request-builder
# or
yarn add vue-api-request-builder
# or
pnpm add vue-api-request-builder
```

## Usage

### Basic Usage

```vue
<template>
  <div class="app-container">
    <RequestForm v-model="requestSchema" @update:modelValue="handleSchemaChange" />
    <ResponseSection v-model="requestSchema" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RequestForm, ResponseSection, type RequestSchema, defaultRequestSchema } from 'vue-api-request-builder';

const requestSchema = ref<RequestSchema>(defaultRequestSchema);

const handleSchemaChange = (newSchema: RequestSchema) => {
  console.log("Schema changed:", newSchema);
};
</script>
```

## Components

### RequestForm

The main component for building API requests. It provides a form interface for configuring:

#### Props
- `modelValue` (RequestSchema): The request schema object (v-model)

#### Events
- `update:modelValue`: Emitted when the schema changes

#### Features
- HTTP method selection (GET, POST, PUT, DELETE, OPTIONS)
- URL configuration with base URL and path
- URL parameters management
- Authentication options:
  - None
  - Basic Auth
  - Bearer Token
- Custom headers
- Request body support for:
  - JSON
  - Form Data
  - Raw text
- Live preview of request URL and body

### ResponseSection

Displays the response from the API request.

#### Props
- `modelValue` (RequestSchema): The request schema object (v-model)

#### Features
- Request method selection (XMLHttpRequest/Fetch)
- Response display:
  - Status code with color coding
  - Response time
  - Response headers
  - Response body with formatting
- Error handling and display

### KeyValueInput

A reusable component for managing key-value pairs.

#### Props
- `modelValue` (KeyValuePair[]): Array of key-value pairs (v-model)
- `addButtonText` (string): Text for the add button
- `showPreview` (boolean): Whether to show the preview
- `previewText` (string): Text to show in preview

#### Events
- `update:modelValue`: Emitted when the key-value pairs change

## Types

### RequestSchema

```typescript
interface RequestSchema {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
  url: string;
  path: string;
  auth: AuthConfig;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
}
```

### AuthConfig

```typescript
interface AuthConfig {
  type: 'none' | 'Basic' | 'Bearer';
  username?: string;
  password?: string;
  token?: string;
}
```

### RequestBody

```typescript
interface RequestBody {
  type: 'application/json' | 'multipart/form-data' | 'text/plain';
  json?: string;
  formData?: KeyValuePair[];
  raw?: string;
}
```

### ResponseData

```typescript
interface ResponseData {
  status: string;
  headers: Record<string, string>;
  body: string;
  timing?: number;
}
```

## Utilities

### executeRequest

```typescript
function executeRequest(
  schema: RequestSchema,
  method: 'fetch' | 'xhr' = 'xhr'
): Promise<ResponseData>
```

Executes the API request using either Fetch API or XMLHttpRequest.

## Dependencies

This package requires:
- Vue 3.x
- Ant Design Vue 4.x

## License

MIT

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

```vue
<template>
  <RequestForm v-model="requestSchema" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RequestForm, type RequestSchema, defaultRequestSchema } from 'api-request-builder';

const requestSchema = ref<RequestSchema>(defaultRequestSchema);
</script>
```

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

## Dependencies

This package requires:
- Vue 3.x
- Ant Design Vue 4.x

## License

MIT

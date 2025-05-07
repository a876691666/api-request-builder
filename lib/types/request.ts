// 基础键值对类型
export interface KeyValuePair {
  key: string;
  value: string;
}

// 认证相关类型
export interface AuthConfig {
  type: 'none' | 'Basic' | 'Bearer';
  username?: string;
  password?: string;
  token?: string;
}

// 请求体类型
export interface RequestBody {
  type: 'application/json' | 'multipart/form-data' | 'text/plain';
  json?: string;
  formData?: KeyValuePair[];
  raw?: string;
}

// 响应类型
export interface ResponseData {
  status: string;
  headers: Record<string, string>;
  body: string;
  timing?: number;
}

// 完整的请求Schema类型
export interface RequestSchema {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
  url: string;
  path: string;
  auth: AuthConfig;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
}

// 默认的请求Schema
export const defaultRequestSchema: RequestSchema = {
  method: 'GET',
  url: 'https://yesno.wtf',
  path: '/api',
  auth: {
    type: 'none'
  },
  params: [],
  headers: [],
  body: {
    type: 'application/json'
  },
};

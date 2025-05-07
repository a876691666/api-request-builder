import type { RequestSchema, ResponseData } from '../types/request';

export type RequestMethod = 'fetch' | 'xhr';

export async function executeRequest(schema: RequestSchema, method: RequestMethod = 'xhr'): Promise<ResponseData> {
  if (method === 'fetch') {
    return executeFetchRequest(schema);
  } else {
    return executeXHRRequest(schema);
  }
}

async function executeFetchRequest(schema: RequestSchema): Promise<ResponseData> {
  // Build URL with query parameters
  const queryString = schema.params
    .filter(p => !!p.key)
    .map(p => `${p.key}=${encodeURIComponent(p.value)}`)
    .join('&');
  const fullUrl = `${schema.url}${schema.path}${queryString ? '?' + queryString : ''}`;

  // Prepare headers
  const headers = new Headers();
  schema.headers.forEach(header => {
    if (header.key) {
      headers.append(header.key, header.value);
    }
  });

  // Prepare request options
  const options: RequestInit = {
    method: schema.method,
    headers,
    credentials: 'omit'
  };

  // Handle authentication
  if (schema.auth.type === 'Basic' && schema.auth.username && schema.auth.password) {
    const auth = btoa(`${schema.auth.username}:${schema.auth.password}`);
    headers.append('Authorization', `Basic ${auth}`);
  } else if (schema.auth.type === 'Bearer' && schema.auth.token) {
    headers.append('Authorization', `Bearer ${schema.auth.token}`);
  }

  // Handle request body for POST/PUT methods
  if (schema.method === 'POST' || schema.method === 'PUT') {
    switch (schema.body.type) {
      case 'application/json':
        options.body = schema.body.json || '';
        headers.set('Content-Type', 'application/json; charset=utf-8');
        break;
      case 'multipart/form-data':
        const formData = new FormData();
        schema.body.formData?.forEach(param => {
          if (param.key) {
            formData.append(param.key, param.value);
          }
        });
        options.body = formData;
        break;
      case 'text/plain':
        options.body = schema.body.raw || '';
        headers.set('Content-Type', 'text/plain; charset=utf-8');
        break;
    }
  }

  try {
    const response = await fetch(fullUrl, options);
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    let body = '';
    const contentType = headers['content-type'] || '';
    if (contentType.startsWith('application/json')) {
      try {
        const json = await response.json();
        body = JSON.stringify(json, null, 2);
      } catch (e) {
        body = await response.text();
      }
    } else {
      body = await response.text();
    }

    return {
      status: response.status.toString(),
      headers,
      body
    };
  } catch (error) {
    throw new Error('Request failed');
  }
}

async function executeXHRRequest(schema: RequestSchema): Promise<ResponseData> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const user = schema.auth.type === 'Basic' ? schema.auth.username : null;
    const pswd = schema.auth.type === 'Basic' ? schema.auth.password : null;

    // Build URL with query parameters
    const queryString = schema.params
      .filter(p => !!p.key)
      .map(p => `${p.key}=${encodeURIComponent(p.value)}`)
      .join('&');
    const fullUrl = `${schema.url}${schema.path}${queryString ? '?' + queryString : ''}`;

    xhr.open(schema.method, fullUrl, true, user, pswd);

    // Add headers
    schema.headers.forEach(header => {
      if (header.key) {
        xhr.setRequestHeader(header.key, header.value);
      }
    });

    // Add Bearer token if present
    if (schema.auth.type === 'Bearer' && schema.auth.token) {
      xhr.setRequestHeader('Authorization', `Bearer ${schema.auth.token}`);
    }

    // Handle request body for POST/PUT methods
    if (schema.method === 'POST' || schema.method === 'PUT') {
      let requestBody = '';
      
      switch (schema.body.type) {
        case 'application/json':
          requestBody = schema.body.json || '';
          xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
          break;
        case 'multipart/form-data':
          const formData = new FormData();
          schema.body.formData?.forEach(param => {
            if (param.key) {
              formData.append(param.key, param.value);
            }
          });
          requestBody = formData as any;
          // Let browser handle multipart/form-data Content-Type and boundary
          break;
        case 'text/plain':
          requestBody = schema.body.raw || '';
          xhr.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
          break;
      }

      xhr.send(requestBody);
    } else {
      xhr.send();
    }

    xhr.onload = () => {
      const headers = parseHeaders(xhr);
      const response: ResponseData = {
        status: xhr.status.toString(),
        headers,
        body: ''
      };

      if ((headers['content-type'] || '').startsWith('application/json')) {
        try {
          response.body = JSON.stringify(JSON.parse(xhr.responseText), null, 2);
        } catch (e) {
          response.body = xhr.responseText;
        }
      } else {
        response.body = xhr.responseText;
      }

      resolve(response);
    };

    xhr.onerror = () => {
      reject(new Error('Request failed'));
    };
  });
}

function parseHeaders(xhr: XMLHttpRequest): Record<string, string> {
  const headers = xhr
    .getAllResponseHeaders()
    .trim()
    .split(/[\r\n]+/);
  const headerMap: Record<string, string> = {};
  headers.forEach(function (line) {
    const parts = line.split(': ');
    const header = parts.shift()?.toLowerCase() || '';
    const value = parts.join(': ');
    headerMap[header] = value;
  });
  return headerMap;
} 
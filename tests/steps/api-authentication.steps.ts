// API 认证步骤定义

import { Given, When, Then } from '@cucumber/cucumber';
import { setEnvVar, makeApiRequest } from './common.steps.js';

// === 环境变量设置（API 认证专用）===

Given('环境变量 API_KEYS 包含 {string}', function (keys: string) {
  setEnvVar('API_KEYS', keys);
});

Given('环境变量 NODE_ENV 为 {string}', function (env: string) {
  setEnvVar('NODE_ENV', env);
});

Given('环境变量 API_KEYS 未配置或为空', function () {
  delete process.env.API_KEYS;
});

// === API 请求步骤 ===

When('我发送 POST 请求到 {string}', function (path: string) {
  (global as any).testState.requestPath = path;
  (global as any).testState.requestMethod = 'POST';
  (global as any).testState.requestHeaders = {};
  (global as any).testState.requestBody = undefined;
});

When('请求头为:', function (docString: string) {
  // 请求头不是 JSON，而是 "Header-Name: value" 格式
  const headers: Record<string, string> = {};
  for (const line of docString.trim().split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      headers[key] = value;
    }
  }
  (global as any).testState.requestHeaders = headers;
});

When('并且请求体为:', async function (docString: string) {
  const body = JSON.parse(docString);
  (global as any).testState.requestBody = JSON.stringify(body);

  const response = await makeApiRequest(
    (global as any).testState.requestMethod || 'POST',
    (global as any).testState.requestPath,
    (global as any).testState.requestHeaders,
    (global as any).testState.requestBody
  );

  (global as any).testState.responseStatus = response.status;
  (global as any).testState.responseData = response.data;
  (global as any).testState.responseHeaders = response.headers;
});

When('我发送 POST 请求到 {string}，请求头为:', async function (path: string, docString: string) {
  const headers = JSON.parse(docString) as Record<string, string>;
  (global as any).testState.requestPath = path;
  (global as any).testState.requestHeaders = headers;
});

When('我发送 POST 请求到 {string}，请求体为:', async function (path: string, docString: string) {
  const body = JSON.parse(docString);
  (global as any).testState.requestPath = path;
  (global as any).testState.requestBody = JSON.stringify(body);

  const response = await makeApiRequest(
    'POST',
    path,
    (global as any).testState.requestHeaders || {},
    (global as any).testState.requestBody
  );

  (global as any).testState.responseStatus = response.status;
  (global as any).testState.responseData = response.data;
});

When('我发送 OPTIONS 请求到 {string}', async function (path: string) {
  const response = await makeApiRequest('OPTIONS', path, {});

  (global as any).testState.responseStatus = response.status;
  (global as any).testState.responseHeaders = response.headers;
});

// === 响应头断言 ===

Then('{string} 应包含 {string}', function (headerName: string, expectedValue: string) {
  const headers = (global as any).testState.responseHeaders;
  const value = headers.get(headerName);
  if (!value || !value.includes(expectedValue)) {
    throw new Error(
      `期望响应头 "${headerName}" 包含 "${expectedValue}"，实际为: ${value}\n完整响应头: ${JSON.stringify([
        ...headers.entries(),
      ])}`
    );
  }
});

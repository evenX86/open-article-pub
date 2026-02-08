// 通用步骤定义 - 共享给所有 feature 使用

import { Given, When, Then } from '@cucumber/cucumber';

// 设置环境变量
export function setEnvVar(key: string, value: string | undefined) {
  if (value !== undefined) {
    process.env[key] = value;
  } else {
    delete process.env[key];
  }
}

// 模拟 API 请求
export async function makeApiRequest(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: string
): Promise<{ status: number; headers: Headers; data: any }> {
  const url = new URL(path, 'http://localhost:3000');

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = body;
  }

  try {
    const response = await fetch(url.toString(), requestInit);
    const data = await response.json().catch(() => null);
    return {
      status: response.status,
      headers: response.headers,
      data,
    };
  } catch (error) {
    return {
      status: 503,
      headers: new Headers(),
      data: { error: 'Service unavailable' },
    };
  }
}

// === 场景背景设置 ===

Given('系统已正确配置微信 AppID 和 AppSecret', function () {
  setEnvVar('WECHAT_APPID', 'test_appid');
  setEnvVar('WECHAT_SECRET', 'test_secret');
});

Given('Access Token 有效且未过期', function () {
  (global as any).testState.mockToken = 'valid_mock_token';
});

// === 响应断言（通用）===

Then('响应状态码应为 {int}', function (expectedStatus: number) {
  const actualStatus = (global as any).testState.responseStatus;
  if (actualStatus !== expectedStatus) {
    throw new Error(
      `期望状态码 ${expectedStatus}，实际为 ${actualStatus}\n响应: ${JSON.stringify(
        (global as any).testState.responseData
      )}`
    );
  }
});

Then('响应体中 {string} 应为 true', function (key: string) {
  const data = (global as any).testState.responseData;
  if (!data || data[key] !== true) {
    throw new Error(`期望响应体中 ${key} = true，实际为 ${data?.[key]}\n完整响应: ${JSON.stringify(data)}`);
  }
});

Then('响应体中 {string} 应为 false', function (key: string) {
  const data = (global as any).testState.responseData;
  if (!data || data[key] !== false) {
    throw new Error(`期望响应体中 ${key} = false，实际为 ${data?.[key]}\n完整响应: ${JSON.stringify(data)}`);
  }
});

Then('响应体中应包含 {string}', function (key: string) {
  const data = (global as any).testState.responseData;
  if (!data || !(key in data)) {
    throw new Error(`期望响应体包含 "${key}"，实际为: ${JSON.stringify(data)}`);
  }
});

Then('响应体中 {string} 应包含 {string}', function (key: string, expectedSubstring: string) {
  const data = (global as any).testState.responseData;
  if (!data || !data[key] || !String(data[key]).includes(expectedSubstring)) {
    throw new Error(
      `期望响应体中 ${key} 包含 "${expectedSubstring}"，实际为 "${data?.[key]}"\n完整响应: ${JSON.stringify(
        data
      )}`
    );
  }
});

Then('响应体中 {string} 应为 {string}', function (key: string, expectedValue: string) {
  const data = (global as any).testState.responseData;
  if (!data || data[key] !== expectedValue) {
    throw new Error(
      `期望响应体中 ${key} = ${expectedValue}，实际为 ${data?.[key]}\n完整响应: ${JSON.stringify(data)}`
    );
  }
});

Then('响应头应包含 {string}', function (headerName: string) {
  const headers = (global as any).testState.responseHeaders;
  const value = headers.get(headerName);
  if (!value) {
    throw new Error(`期望响应头包含 "${headerName}"`);
  }
});

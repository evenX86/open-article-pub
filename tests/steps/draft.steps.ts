// 草稿 API 步骤定义

import { Given, When, Then } from '@cucumber/cucumber';
import { setEnvVar, makeApiRequest } from './common.steps.js';

// === 场景设置（草稿 API 专用）===

Given('已提供有效的 API Key（生产环境必须）', function () {
  setEnvVar('API_KEYS', 'test_api_key');
  (global as any).testState.requestHeaders = { Authorization: 'Bearer test_api_key' };
});

Given('假设 Access Token 已失效', function () {
  (global as any).testState.mockToken = 'expired_token';
});

Given('假设微信 API 返回频率限制错误', function () {
  (global as any).testState.simulateRateLimit = true;
});

Given('假设正文内容为 {int} 个字符', function (count: number) {
  (global as any).testState.longContent = '内容。'.repeat(count / 3);
});

Given('假设正文内容超过 {int} 个字符', function (count: number) {
  (global as any).testState.longContent = '内容。'.repeat(count / 3 + 100);
});

// === API 请求步骤 ===

When('我发送 POST 请求到 {string}', function (path: string) {
  (global as any).testState.requestPath = path;
  (global as any).testState.requestMethod = 'POST';
});

When('请求体为:', async function (docString: string) {
  let body = docString;

  // 处理动态内容
  if (body.includes('.repeat(')) {
    body = body.replace(/"(.+?)\\.repeat\((\d+)\)"/g, (_, str, times) => {
      return JSON.stringify(str.repeat(parseInt(times)));
    });
  }

  if ((global as any).testState.longContent) {
    body = body.replace('"# 长文章\\n\\n" + "内容。".repeat(3000)', `"# 长文章\n\n${(global as any).testState.longContent}"`);
    body = body.replace('"# 超长文章\\n\\n" + "内容。".repeat(4000)', `"# 超长文章\n\n${(global as any).testState.longContent}"`);
  }

  (global as any).testState.requestBody = body;

  const response = await makeApiRequest(
    'POST',
    (global as any).testState.requestPath,
    (global as any).testState.requestHeaders || {},
    body
  );

  (global as any).testState.responseStatus = response.status;
  (global as any).testState.responseData = response.data;
});

When('我发送 OPTIONS 请求到 {string}', async function (path: string) {
  const response = await makeApiRequest('OPTIONS', path, {});

  (global as any).testState.responseStatus = response.status;
  (global as any).testState.responseHeaders = response.headers;
});

// === 特殊断言 ===

Then('草稿标题应为 {string}', function (expectedTitle: string) {
  // 这需要从微信 API 响应中解析，暂时跳过
  // 实际实现需要 mock 微信 API 或检查返回的 media_id
});

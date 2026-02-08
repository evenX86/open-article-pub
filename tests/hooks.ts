// Cucumber 钩子 - ES 模块版本
// 在所有场景运行前执行

import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';

// 全局测试状态
interface TestState {
  // Markdown 转换相关
  markdownInput: string | null;
  htmlOutput: string | null;
  conversionError: Error | null;

  // API 认证相关
  apiKey: string | null;
  apiResponse: any;
  apiError: Error | null;

  // Token 管理相关
  tokenCache: any;
  wechatApiCalls: number;

  // 重置状态
  reset(): void;
}

const testState: TestState = {
  markdownInput: null,
  htmlOutput: null,
  conversionError: null,
  apiKey: null,
  apiResponse: null,
  apiError: null,
  tokenCache: null,
  wechatApiCalls: 0,

  reset() {
    this.markdownInput = null;
    this.htmlOutput = null;
    this.conversionError = null;
    this.apiKey = null;
    this.apiResponse = null;
    this.apiError = null;
    this.wechatApiCalls = 0;
  }
};

// 将状态暴露给全局
(global as any).testState = testState;

// BeforeAll 钩子：在所有测试前运行一次
BeforeAll(async function () {
  console.log('🧪 Starting BDD test suite...');
});

// AfterAll 钩子：在所有测试后运行一次
AfterAll(async function () {
  console.log('✅ BDD test suite completed');
});

// Before 钩子：在每个场景前运行
Before(function () {
  testState.reset();
});

// After 钩子：在每个场景后运行
After(function ({ result }) {
  if (result?.status === 'FAILED') {
    console.log('❌ Scenario failed:', result.message);
  }
});

// Markdown 转换步骤定义

import { Given, When, Then } from '@cucumber/cucumber';
import { convertMarkdownToHtml } from '../../lib/markdown/converter';

// 辅助函数：确保已执行转换
function ensureConverted() {
  const state = (global as any).testState;
  if (state.htmlOutput === null && state.markdownInput !== null) {
    try {
      state.htmlOutput = convertMarkdownToHtml(state.markdownInput);
      state.conversionError = null;
    } catch (error) {
      state.conversionError = error;
      throw error;
    }
  }
}

// === 场景：正确转换各级标题 ===

Given('输入 Markdown 为 {string}', function (markdown: string) {
  // 存储输入的 Markdown
  // 转义序列 \n 需要转换为实际换行符
  const decoded = markdown.replace(/\\n/g, '\n');
  (global as any).testState.markdownInput = decoded;
});

When('系统需要将 Markdown 转换为 HTML', function () {
  try {
    const html = convertMarkdownToHtml((global as any).testState.markdownInput);
    (global as any).testState.htmlOutput = html;
    (global as any).testState.conversionError = null;
  } catch (error) {
    (global as any).testState.conversionError = error;
  }
});

Then('输出应包含 {string}', function (expected: string) {
  ensureConverted();
  const html = (global as any).testState.htmlOutput;
  if (html === null) {
    throw new Error('HTML 输出为空，转换可能失败');
  }
  // 解析转义序列
  const decodedExpected = expected.replace(/\\n/g, '\n');
  if (!html.includes(decodedExpected)) {
    throw new Error(`期望输出包含 "${decodedExpected}"，但实际输出为:\n${html}`);
  }
});

Then('输出不应包含 {string}', function (unexpected: string) {
  ensureConverted();
  const html = (global as any).testState.htmlOutput;
  if (html === null) {
    throw new Error('HTML 输出为空，转换可能失败');
  }
  if (html.includes(unexpected)) {
    throw new Error(`期望输出不包含 "${unexpected}"，但实际输出为:\n${html}`);
  }
});

Then('{string} 应被转义为 {string}', function (char: string, escaped: string) {
  ensureConverted();
  const html = (global as any).testState.htmlOutput;
  if (html === null) {
    throw new Error('HTML 输出为空，转换可能失败');
  }
  if (!html.includes(escaped)) {
    throw new Error(`期望 "${char}" 被转义为 "${escaped}"，但实际输出为:\n${html}`);
  }
});

Then('输出应为 {string}', function (expected: string) {
  ensureConverted();
  const html = (global as any).testState.htmlOutput;
  if (html === null) {
    throw new Error('HTML 输出为空，转换可能失败');
  }
  if (html !== expected) {
    throw new Error(`期望输出为 "${expected}"，但实际输出为:\n${html}`);
  }
});

Then('{string} 属性应被移除', function (attribute: string) {
  ensureConverted();
  const html = (global as any).testState.htmlOutput;
  if (html === null) {
    throw new Error('HTML 输出为空，转换可能失败');
  }
  // 检查是否包含该属性
  const attrPattern = new RegExp(`\\s${attribute}=`);
  if (attrPattern.test(html)) {
    throw new Error(`期望 "${attribute}" 属性被移除，但实际输出仍包含它:\n${html}`);
  }
});

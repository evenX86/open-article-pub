/**
 * 使用示例：如何从本地调用 API 创建微信草稿
 *
 * 这个文件展示了如何在 Node.js 环境中调用本项目的 API
 */

const API_BASE_URL = 'http://localhost:3000';

/**
 * 创建微信草稿
 * @param {string} markdown - Markdown 格式的文章内容
 * @param {object} options - 可选参数
 * @returns {Promise<string>} 返回 media_id
 */
async function createWechatDraft(markdown, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      markdown,
      ...options,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(`创建草稿失败: ${result.error}`);
  }

  return result.media_id;
}

// 示例 1: 简单的 Markdown 文章
async function example1() {
  const markdown = `# 我的第一篇文章

这是一段**粗体**文本和一段*斜体*文本。

## 子标题

- 列表项 1
- 列表项 2
- 列表项 3

[链接到 Google](https://google.com)
`;

  try {
    const mediaId = await createWechatDraft(markdown, {
      title: '我的第一篇文章',
      author: '张三',
    });
    console.log('草稿创建成功! media_id:', mediaId);
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 示例 2: 使用 Frontmatter
async function example2() {
  const markdown = `---
title: 使用 Frontmatter 的文章
author: 李四
digest: 这是一篇关于技术分享的文章
---

# 技术分享

今天分享一个关于 Next.js 的开发技巧。

## 主要内容

1. App Router
2. Server Components
3. API Routes
`;

  try {
    // 不需要传 title 和 author，会从 frontmatter 中提取
    const mediaId = await createWechatDraft(markdown);
    console.log('草稿创建成功! media_id:', mediaId);
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 运行示例
// example1();
// example2();

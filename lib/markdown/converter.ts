/**
 * Markdown 转 微信图文格式转换器
 *
 * 功能：
 * 1. 将 Markdown 解析为 HTML
 * 2. 处理微信支持的 HTML 标签
 * 3. 处理图片引用（需要先上传到微信素材库）
 * 4. 生成符合微信要求的内容格式
 *
 * 微信 HTML 支持说明：
 * - 支持基础标签：div, p, span, h1-h6, strong, em, a, img
 * - 不支持：script, style, iframe 等标签
 * - 图片必须使用微信素材库的 URL
 */

import type { DraftArticle } from '../wechat/types.js';

/** 转换配置选项 */
export interface ConvertOptions {
  /** 文章标题（必填） */
  title: string;
  /** 作者 */
  author?: string;
  /** 摘要（单图文） */
  digest?: string;
  /** 阅读原文链接 */
  contentSourceUrl?: string;
  /** 封面图片素材 ID */
  thumbMediaId?: string;
  /** 是否打开评论 */
  needOpenComment?: 0 | 1;
  /** 是否仅粉丝可评论 */
  onlyFansCanComment?: 0 | 1;
}

/**
 * Markdown 转 微信草稿格式
 *
 * @param markdown Markdown 内容
 * @param options 转换选项
 * @returns 微信图文消息对象
 */
export function markdownToDraftArticle(
  markdown: string,
  options: ConvertOptions
): DraftArticle {
  // 1. 将 Markdown 转换为 HTML
  const htmlContent = convertMarkdownToHtml(markdown);

  // 2. 处理图片引用（这里需要先上传图片到微信，获取素材 ID）
  // 暂时保留原始 HTML，后续可以实现自动图片上传

  // 3. 构建草稿文章对象
  const article: DraftArticle = {
    article_type: 'news',
    title: options.title,
    content: htmlContent,
  };

  // 添加可选字段
  if (options.author) {
    article.author = options.author;
  }
  if (options.digest) {
    article.digest = options.digest;
  }
  if (options.contentSourceUrl) {
    article.content_source_url = options.contentSourceUrl;
  }
  if (options.thumbMediaId) {
    article.thumb_media_id = options.thumbMediaId;
  }
  if (options.needOpenComment !== undefined) {
    article.need_open_comment = options.needOpenComment;
  }
  if (options.onlyFansCanComment !== undefined) {
    article.only_fans_can_comment = options.onlyFansCanComment;
  }

  return article;
}

/**
 * 简单的 Markdown 转 HTML
 *
 * 注意：这是一个基础实现，生产环境建议使用成熟的库如：
 * - marked
 * - markdown-it
 * - remark
 */
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // 标题（h1-h6）
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');

  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>');

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 引用
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // 无序列表
  html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 有序列表
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>');

  // 段落（连续的非空行）
  html = html.replace(/^(?!<[h|u|o|p|b|d|pre]).+$/gm, '<p>$&</p>');

  // 换行
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br />');

  return html;
}

/**
 * 从 Markdown Frontmatter 提取元数据
 *
 * 支持的格式：
 * ```yaml
 * ---
 * title: 文章标题
 * author: 作者
 * digest: 摘要
 * ---
 * ```
 */
export interface FrontmatterData {
  title?: string;
  author?: string;
  digest?: string;
  contentSourceUrl?: string;
  thumbMediaId?: string;
  [key: string]: string | undefined;
}

export function extractFrontmatter(markdown: string): {
  frontmatter: FrontmatterData;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const frontmatterText = match[1];
  const content = match[2];
  const frontmatter: FrontmatterData = {};

  // 解析 YAML 格式的 frontmatter
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content };
}

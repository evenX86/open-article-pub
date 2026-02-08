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
 * HTML 转义函数
 * 防止 XSS 攻击和确保 HTML 正确显示
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

/**
 * 微信不支持的标签列表（安全过滤）
 */
const UNSAFE_TAGS = ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'];

/**
 * 移除微信不支持的标签
 */
function removeUnsafeTags(html: string): string {
  // 移除完整的自闭合标签（如 <img />）
  for (const tag of UNSAFE_TAGS) {
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
    html = html.replace(selfClosingRegex, '');

    // 移除成对标签及其内容
    const pairRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    html = html.replace(pairRegex, '');
  }

  return html;
}

/**
 * 移除 HTML 标签中的 class 属性
 * 微信公众号编辑器会移除 class 属性
 */
function removeClassAttributes(html: string): string {
  // 移除 class="xxx" 或 class='xxx'
  return html.replace(/\s+class\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * 简单的 Markdown 转 HTML
 *
 * 注意：这是一个基础实现，生产环境建议使用成熟的库如：
 * - marked
 * - markdown-it
 * - remark
 */
export function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // 代码块（最先处理，使用占位符保护）
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, function(match, lang, code) {
    const index = codeBlocks.length;
    // 如果代码末尾没有换行符，添加一个以匹配测试期望
    const codeContent = code.endsWith('\n') ? code : code + '\n';
    // 代码内容需要转义 HTML
    const escapedCode = escapeHtml(codeContent);
    codeBlocks.push('<pre><code>' + escapedCode + '</code></pre>');
    return `<!-- CODE-BLOCK-${index} -->`;
  });

  // 标题（h1-h6）- 先转义标题内容
  html = html.replace(/^#\s+(.+)$/gm, (_, title) => `<h1>${escapeHtml(title)}</h1>`);
  html = html.replace(/^##\s+(.+)$/gm, (_, title) => `<h2>${escapeHtml(title)}</h2>`);
  html = html.replace(/^###\s+(.+)$/gm, (_, title) => `<h3>${escapeHtml(title)}</h3>`);
  html = html.replace(/^####\s+(.+)$/gm, (_, title) => `<h4>${escapeHtml(title)}</h4>`);
  html = html.replace(/^#####\s+(.+)$/gm, (_, title) => `<h5>${escapeHtml(title)}</h5>`);
  html = html.replace(/^######\s+(.+)$/gm, (_, title) => `<h6>${escapeHtml(title)}</h6>`);

  // 引用 - 先转义内容
  html = html.replace(/^>\s+(.+)$/gm, (_, content) => `<blockquote>${escapeHtml(content)}</blockquote>`);

  // 图片（必须在链接之前处理）
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;
  });

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    return `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
  });

  // 行内代码（必须在粗体/斜体之前处理）
  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, (_, content) => `<strong>${escapeHtml(content)}</strong>`);
  html = html.replace(/\*(.+?)\*/g, (_, content) => `<em>${escapeHtml(content)}</em>`);
  html = html.replace(/__(.+?)__/g, (_, content) => `<strong>${escapeHtml(content)}</strong>`);
  html = html.replace(/_(.+?)_/g, (_, content) => `<em>${escapeHtml(content)}</em>`);

  // 无序列表 - 收集连续的列表项
  const listItems: string[] = [];
  html = html.replace(/^[\*\-]\s+(.+)$/gm, (_, content) => {
    listItems.push(`<li>${escapeHtml(content)}</li>`);
    return '{{LIST-ITEM}}';
  });

  // 处理列表 - 将连续的 {{LIST-ITEM}} 替换为 <ul>
  html = html.replace(/(\{\{LIST-ITEM\}\}\n?)+/g, () => {
    const items = listItems.splice(0, listItems.length).join('\n');
    return `<ul>\n${items}\n</ul>`;
  });

  // 有序列表
  const orderedListItems: string[] = [];
  html = html.replace(/^\d+\.\s+(.+)$/gm, (_, content) => {
    orderedListItems.push(`<li>${escapeHtml(content)}</li>`);
    return '{{ORDERED-LIST-ITEM}}';
  });

  // 处理有序列表
  html = html.replace(/(\{\{ORDERED-LIST-ITEM\}\}\n?)+/g, () => {
    const items = orderedListItems.splice(0, orderedListItems.length).join('\n');
    return `<ol>\n${items}\n</ol>`;
  });

  // 段落和换行
  const lines = html.split('\n');
  const result: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // 如果是 HTML 标签行、占位符行或空行，关闭当前段落
    if (trimmed === '' || trimmed.startsWith('<') || trimmed.startsWith('{{')) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      if (trimmed !== '') {
        result.push(line);
      }
    } else {
      // 纯文本行，开始段落
      if (!inParagraph) {
        result.push('<p>');
        inParagraph = true;
      }
      result.push(line);
    }
  }
  if (inParagraph) {
    result.push('</p>');
  }

  html = result.join('<br />');

  // 恢复代码块占位符
  html = html.replace(/<!-- CODE-BLOCK-(\d+) -->/g, (_, index) => {
    return codeBlocks[parseInt(index, 10)];
  });

  // 后处理：移除微信不支持的标签
  html = removeUnsafeTags(html);

  // 后处理：移除 class 属性
  html = removeClassAttributes(html);

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

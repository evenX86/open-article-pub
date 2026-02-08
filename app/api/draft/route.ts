/**
 * 新增草稿 API 路由
 *
 * 这是提供给 Claude Code Skill 调用的接口
 *
 * POST /api/draft
 *
 * 请求头：
 * Authorization: Bearer <api_key>  或  X-API-Key: <api_key>
 *
 * 请求体：
 * {
 *   "markdown": "# 标题\n\n内容...",
 *   "title": "文章标题（可选，默认从 frontmatter 或第一个标题提取）",
 *   "author": "作者（可选）",
 *   "digest": "摘要（可选）",
 *   "thumbMediaId": "封面图片素材 ID（可选）"
 * }
 *
 * 响应：
 * {
 *   "success": true,
 *   "media_id": "草稿媒体 ID"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { addDraft } from '@/lib/wechat/draft';
import { markdownToDraftArticle, extractFrontmatter } from '@/lib/markdown/converter';
import { checkAuth } from '@/lib/auth/api-guard';

interface DraftRequest {
  /** Markdown 内容 */
  markdown: string;
  /** 文章标题（可选） */
  title?: string;
  /** 作者（可选） */
  author?: string;
  /** 摘要（可选） */
  digest?: string;
  /** 阅读原文链接（可选） */
  contentSourceUrl?: string;
  /** 封面图片素材 ID（可选） */
  thumbMediaId?: string;
  /** 是否打开评论（可选） */
  needOpenComment?: 0 | 1;
  /** 是否仅粉丝可评论（可选） */
  onlyFansCanComment?: 0 | 1;
}

interface DraftResponse {
  success: boolean;
  media_id?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<DraftResponse>> {
  // 认证检查
  const authError = checkAuth(request);
  if (authError) {
    return authError as NextResponse<DraftResponse>;
  }

  try {
    // 解析请求体
    const body: DraftRequest = await request.json();

    // 验证必填字段
    if (!body.markdown) {
      return NextResponse.json(
        { success: false, error: 'markdown is required' },
        { status: 400 }
      );
    }

    // 提取 frontmatter 和内容
    const { frontmatter, content } = extractFrontmatter(body.markdown);

    // 确定标题（优先级：请求参数 > frontmatter > 第一个 h1）
    let title = body.title;
    if (!title) {
      title = frontmatter.title;
    }
    if (!title) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'title is required (provide in request, frontmatter, or as first heading)' },
        { status: 400 }
      );
    }

    // 转换为草稿格式
    const article = markdownToDraftArticle(content, {
      title,
      author: body.author || frontmatter.author,
      digest: body.digest || frontmatter.digest,
      contentSourceUrl: body.contentSourceUrl || frontmatter.contentSourceUrl,
      thumbMediaId: body.thumbMediaId || frontmatter.thumbMediaId,
      needOpenComment: body.needOpenComment,
      onlyFansCanComment: body.onlyFansCanComment,
    });

    // 调用微信 API
    const mediaId = await addDraft(article);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      media_id: mediaId,
    });

  } catch (error) {
    console.error('Error adding draft:', error);

    // 处理微信 API 错误
    if (error && typeof error === 'object' && 'errcode' in error) {
      const wechatError = error as { errcode: number; errmsg?: string };
      return NextResponse.json(
        {
          success: false,
          error: `WeChat API Error [${wechatError.errcode}]: ${wechatError.errmsg || 'Unknown'}`,
        },
        { status: 400 }
      );
    }

    // 处理其他错误
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 支持 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  });
}

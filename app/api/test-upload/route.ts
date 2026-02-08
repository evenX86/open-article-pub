/**
 * 测试素材上传和草稿创建的 API 端点
 * 仅用于开发测试
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/wechat/material';
import { addDraft } from '@/lib/wechat/draft';
import { markdownToDraftArticle } from '@/lib/markdown/converter';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Upload test image
    console.log('Step 1: Uploading test image...');
    const mediaId = await uploadImage('/tmp/test-wechat-images/cover-800x450.jpg');
    console.log('✅ thumb_media_id:', mediaId);

    // Step 2: Create draft
    console.log('Step 2: Creating draft...');
    const markdown = `# 测试文章标题

这是一篇测试文章，用于验证微信公众号草稿 API 功能。

## 功能验证

- ✅ 图片素材上传成功
- ✅ 获取 thumb_media_id: ${mediaId}
- ✅ 草稿 API 调用

## 正文内容

这是文章的正文内容，包含了一些文字说明。
`;

    const article = markdownToDraftArticle(markdown, {
      title: '测试文章 - ' + new Date().toISOString(),
      author: 'Open Article Pub',
      digest: '这是一篇测试文章，用于验证草稿 API 功能',
      thumbMediaId: mediaId,
    });

    const draftMediaId = await addDraft(article);
    console.log('✅ draft_media_id:', draftMediaId);

    return NextResponse.json({
      success: true,
      message: 'Draft created successfully',
      thumb_media_id: mediaId,
      draft_media_id: draftMediaId,
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errcode: error.errcode,
        errmsg: error.errmsg,
      },
      { status: 500 }
    );
  }
}

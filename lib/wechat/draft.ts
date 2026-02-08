/**
 * 微信草稿箱 API 封装
 *
 * API 文档：
 * https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_add.html
 */

import { config } from '../config';
import { getAccessToken } from './auth';
import { extractWechatError } from './errors';
import type {
  AddDraftRequest,
  AddDraftResponse,
  DraftArticle,
} from './types';

/**
 * 微信草稿箱管理器
 */
export class WechatDraft {
  /**
   * 新增草稿
   * @param articles 图文素材集合
   * @param accessToken 可选的 Access Token，不传则自动获取
   * @returns media_id
   */
  async add(
    articles: DraftArticle | DraftArticle[],
    accessToken?: string
  ): Promise<string> {
    // 标准化输入为数组
    const articlesArray = Array.isArray(articles) ? articles : [articles];

    // 获取 Access Token
    const token = accessToken || await getAccessToken();

    // 构建请求
    const requestBody: AddDraftRequest = {
      articles: articlesArray,
    };

    const url = new URL(`${config.apiBaseUrl}/draft/add`);
    url.searchParams.append('access_token', token);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as AddDraftResponse | {
        errcode: number;
        errmsg: string;
      };

      // 检查错误响应
      const error = extractWechatError(data);
      if (error) {
        throw error;
      }

      // 验证响应数据
      if (!('media_id' in data) || !data.media_id) {
        throw new Error('Invalid response: missing media_id');
      }

      return data.media_id;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to add draft');
    }
  }
}

/**
 * 全局草稿箱单例
 */
let globalDraft: WechatDraft | null = null;

/**
 * 获取全局草稿箱实例
 */
export function getDraft(): WechatDraft {
  if (!globalDraft) {
    globalDraft = new WechatDraft();
  }
  return globalDraft;
}

/**
 * 新增草稿的便捷方法
 */
export async function addDraft(
  articles: DraftArticle | DraftArticle[],
  accessToken?: string
): Promise<string> {
  // 测试模式：返回模拟响应，不调用真实 API
  if (process.env.WECHAT_MOCK_API === 'true') {
    console.log('[Mock] addDraft called, returning mock media_id');
    return 'mock_media_id_' + Date.now();
  }

  return getDraft().add(articles, accessToken);
}

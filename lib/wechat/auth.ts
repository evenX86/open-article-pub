/**
 * 微信 Access Token 管理器
 *
 * 流程：
 * 1. 使用 AppID 和 AppSecret 获取 Access Token
 * 2. 缓存 Token 避免频繁请求
 * 3. Token 过期前自动刷新
 *
 * API 文档：
 * https://developers.weixin.qq.com/miniprogram/dev/server/API/mp-access-token/api_getaccesstoken.html
 */

import { config } from '../config.js';
import { tokenCache } from '../cache/token-cache.js';
import { extractWechatError } from './errors.js';
import type {
  GetAccessTokenRequest,
  GetAccessTokenResponse,
} from './types.js';

/**
 * 微信认证管理器
 */
export class WechatAuth {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(appId?: string, appSecret?: string) {
    this.appId = appId || config.wechatAppid;
    this.appSecret = appSecret || config.wechatSecret;

    if (!this.appId || !this.appSecret) {
      throw new Error('WeChat AppID and AppSecret are required');
    }
  }

  /**
   * 获取 Access Token（带缓存）
   * @param forceRefresh 是否强制刷新
   */
  async getAccessToken(forceRefresh = false): Promise<string> {
    // 如果不强制刷新，先尝试从缓存获取
    if (!forceRefresh) {
      const cachedToken = tokenCache.get();
      if (cachedToken) {
        return cachedToken;
      }
    }

    // 从微信 API 获取新 Token
    const token = await this.fetchAccessToken();

    // 缓存 Token（默认 7200 秒）
    tokenCache.set(token, config.tokenCacheTtl);

    return token;
  }

  /**
   * 从微信 API 获取 Access Token
   */
  private async fetchAccessToken(): Promise<string> {
    const params: GetAccessTokenRequest = {
      grant_type: 'client_credential',
      appid: this.appId,
      secret: this.appSecret,
    };

    const url = new URL(`${config.apiBaseUrl}/token`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json()) as GetAccessTokenResponse | {
        errcode: number;
        errmsg: string;
      };

      // 检查错误响应
      const error = extractWechatError(data);
      if (error) {
        throw error;
      }

      // 验证响应数据
      if (!('access_token' in data) || !data.access_token) {
        throw new Error('Invalid response: missing access_token');
      }

      return data.access_token;
    } catch (error) {
      // 网络错误或其他异常
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch access token');
    }
  }

  /**
   * 使缓存失效（在 Token 失效时调用）
   */
  invalidateCache(): void {
    tokenCache.clear();
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus() {
    return tokenCache.getStatus();
  }
}

/**
 * 全局认证单例
 */
let globalAuth: WechatAuth | null = null;

/**
 * 获取全局认证实例
 */
export function getAuth(): WechatAuth {
  if (!globalAuth) {
    globalAuth = new WechatAuth();
  }
  return globalAuth;
}

/**
 * 获取 Access Token 的便捷方法
 */
export async function getAccessToken(forceRefresh = false): Promise<string> {
  return getAuth().getAccessToken(forceRefresh);
}

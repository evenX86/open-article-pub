/**
 * 微信 API 统一客户端
 *
 * 提供统一的入口访问所有微信 API 功能
 * 参考设计：silicoco 项目中的 Stripe 客户端代理模式
 */

import { WechatAuth, getAuth } from './auth';
import { WechatDraft, getDraft } from './draft';

/**
 * 微信 API 客户端
 *
 * 使用方式：
 * ```ts
 * import { wechat } from '@/lib/wechat/client';
 *
 * // 获取 Access Token
 * const token = await wechat.auth.getAccessToken();
 *
 * // 新增草稿
 * const mediaId = await wechat.draft.add({
 *   title: '标题',
 *   content: '<p>内容</p>',
 * });
 * ```
 */
export class WechatClient {
  readonly auth: WechatAuth;
  readonly draft: WechatDraft;

  constructor(appId?: string, appSecret?: string) {
    this.auth = new WechatAuth(appId, appSecret);
    this.draft = new WechatDraft();
  }
}

/**
 * 全局微信客户端单例
 *
 * 使用代理模式实现延迟初始化和类型安全
 */
export const wechat = new Proxy({} as WechatClient, {
  get(_target, prop) {
    const client = new WechatClient();

    if (prop in client) {
      const key = prop as keyof WechatClient;
      return client[key];
    }

    throw new Error(`Wechat client does not have property: ${String(prop)}`);
  },
});

// 导出便捷访问函数
export { getAuth, getDraft };
export type * from './types';

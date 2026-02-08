/**
 * 微信 API 错误处理
 * 错误码参考：https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Interface_field_description.html
 */

import { WechatApiError } from './types.js';

/** 错误码对应的错误信息 */
const ERROR_MESSAGES: Record<number, string> = {
  '-1': '系统繁忙，请稍候再试',
  '40001': 'access_token 无效或不是最新的',
  '40002': '不合法的凭证类型',
  '40013': '不合法的 AppID',
  '40125': '不合法的 secret',
  '40164': '调用接口的 IP 地址不在白名单中',
  '40243': 'AppSecret 已被冻结，请解冻后再次调用',
  '41004': '缺少 secret 参数',
  '50004': '禁止使用 token 接口',
  '50007': '账号已冻结',
};

/**
 * 从微信 API 响应中提取错误
 */
export function extractWechatError(response: unknown): WechatApiError | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const resp = response as { errcode?: number; errmsg?: string };

  if (typeof resp.errcode === 'number' && resp.errcode !== 0) {
    const errmsg = resp.errmsg || ERROR_MESSAGES[resp.errcode] || '未知错误';
    return new WechatApiError(resp.errcode, errmsg);
  }

  return null;
}

/**
 * 判断是否为 Token 相关错误（需要重新获取 Token）
 */
export function isTokenRelatedError(error: WechatApiError): boolean {
  return [40001, 40014, 42001, 42002, 42007].includes(error.errcode);
}

/**
 * 判断是否为认证相关错误（需要检查 AppID/AppSecret）
 */
export function isAuthError(error: WechatApiError): boolean {
  return [40013, 40125, 40164, 40243, 41004].includes(error.errcode);
}

/**
 * 格式化错误信息用于日志输出
 */
export function formatError(error: WechatApiError): string {
  let msg = `[${error.errcode}] ${error.errmsg}`;
  if (error.apiUrl) {
    msg += ` (${error.apiUrl})`;
  }
  return msg;
}

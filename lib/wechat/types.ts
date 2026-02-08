/**
 * 微信公众号 API 类型定义
 * 参考：https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_add.html
 */

// ============ Access Token 相关 ============

/** 获取 Access Token 请求参数 */
export interface GetAccessTokenRequest {
  /** 填写 client_credential */
  grant_type: 'client_credential';
  /** 账号的唯一凭证 */
  appid: string;
  /** 唯一凭证密钥 */
  secret: string;
}

/** 获取 Access Token 响应 */
export interface GetAccessTokenResponse {
  /** 获取到的凭证 */
  access_token: string;
  /** 凭证有效时间，单位：秒，目前是 7200 秒 */
  expires_in: number;
}

/** 获取 Access Token 错误响应 */
export interface GetAccessTokenErrorResponse {
  errcode: number;
  errmsg: string;
}

// ============ 草稿箱相关 ============

/** 文章类型 */
export type ArticleType = 'news' | 'newspic';

/** 单个图文消息 */
export interface DraftArticle {
  /** 文章类型，默认为 news */
  article_type?: ArticleType;
  /** 标题，总长度不超过 32 个字 */
  title: string;
  /** 作者，总长度不超过 16 个字 */
  author?: string;
  /** 摘要，总长度不超过 128 个字，仅单图文有 */
  digest?: string;
  /** 图文消息的具体内容，支持 HTML 标签，不超过 2 万字符 */
  content: string;
  /** 图文消息的原文地址（阅读原文链接） */
  content_source_url?: string;
  /** 图文消息的封面图片素材 id（必须是永久 MediaID） */
  thumb_media_id?: string;
  /** 是否打开评论，0 不打开(默认)，1 打开 */
  need_open_comment?: 0 | 1;
  /** 是否粉丝才可评论，0 所有人可评论(默认)，1 粉丝才可评论 */
  only_fans_can_comment?: 0 | 1;
}

/** 新增草稿请求参数 */
export interface AddDraftRequest {
  /** 图文素材集合 */
  articles: DraftArticle[];
}

/** 新增草稿响应 */
export interface AddDraftResponse {
  /** 上传后的获取标志 */
  media_id: string;
}

/** 草稿箱 API 错误响应 */
export interface DraftErrorResponse {
  errcode: number;
  errmsg: string;
}

// ============ 通用错误码 ============

/** 微信 API 通用错误码 */
export enum WechatErrorCode {
  SYSTEM_ERROR = -1,
  INVALID_CREDENTIAL = 40001,
  INVALID_GRANT_TYPE = 40002,
  INVALID_APPID = 40013,
  INVALID_SECRET = 40125,
  IP_NOT_IN_WHITELIST = 40164,
  APPSECRET_FROZEN = 40243,
  APPSECRET_MISSING = 41004,
  TOKEN_FORBIDDEN = 50004,
  ACCOUNT_FROZEN = 50007,
}

/** 微信 API 错误类 */
export class WechatApiError extends Error {
  constructor(
    public errcode: number,
    public errmsg: string,
    public apiUrl?: string
  ) {
    super(`WeChat API Error [${errcode}]: ${errmsg}`);
    this.name = 'WechatApiError';
  }
}

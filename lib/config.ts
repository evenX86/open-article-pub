/**
 * 配置管理
 * 参考 silicoco 项目的配置管理方式
 */

interface Config {
  /** 微信 AppID */
  wechatAppid: string;
  /** 微信 AppSecret */
  wechatSecret: string;
  /** Token 缓存时间（秒） */
  tokenCacheTtl: number;
  /** 是否为开发模式 */
  isDevelopment: boolean;
  /** 是否为生产模式 */
  isProduction: boolean;
  /** API 基础地址 */
  apiBaseUrl: string;
}

/**
 * 获取环境变量，如果不存在则抛出错误
 */
function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

/**
 * 获取数字类型的环境变量
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 全局配置单例
 */
export const config: Config = {
  get wechatAppid(): string {
    return getEnvVar('WECHAT_APPID');
  },

  get wechatSecret(): string {
    return getEnvVar('WECHAT_SECRET');
  },

  get tokenCacheTtl(): number {
    return getEnvNumber('WECHAT_TOKEN_CACHE_TTL', 7200);
  },

  get isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  get apiBaseUrl(): string {
    // 微信公众号 API 基础地址
    return 'https://api.weixin.qq.com/cgi-bin';
  },
};

/**
 * 验证配置完整性
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.wechatAppid) {
    errors.push('WECHAT_APPID is required');
  }

  if (!config.wechatSecret) {
    errors.push('WECHAT_SECRET is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * 获取配置摘要（用于日志，隐藏敏感信息）
 */
export function getConfigSummary(): object {
  return {
    appid: config.wechatAppid ? `${config.wechatAppid.slice(0, 8)}...` : '(not set)',
    secret: config.wechatSecret ? '*** (hidden)' : '(not set)',
    tokenCacheTtl: config.tokenCacheTtl,
    isDevelopment: config.isDevelopment,
    apiBaseUrl: config.apiBaseUrl,
  };
}

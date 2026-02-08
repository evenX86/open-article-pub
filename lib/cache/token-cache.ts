/**
 * Access Token 内存缓存管理
 *
 * 设计考虑：
 * 1. Access Token 有效期为 7200 秒，需要缓存避免频繁请求
 * 2. Token 获取接口有调用频率限制
 * 3. 多实例部署时需要考虑分布式缓存（可扩展为 Redis）
 * 4. 严格管控 Token 泄露风险
 */

/** Token 缓存项 */
interface TokenCacheItem {
  /** Access Token */
  token: string;
  /** 过期时间戳（毫秒） */
  expiresAt: number;
  /** 创建时间戳（毫秒） */
  createdAt: number;
}

/**
 * Token 缓存管理器
 */
class TokenCache {
  private cache: TokenCacheItem | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * 设置 Token
   * @param token Access Token
   * @param expiresIn 有效期（秒）
   */
  set(token: string, expiresIn: number): void {
    // 提前 5 分钟过期，确保在请求前不会过期
    const bufferTime = 5 * 60 * 1000; // 5 分钟
    const expiresAt = Date.now() + expiresIn * 1000 - bufferTime;

    this.cache = {
      token,
      expiresAt,
      createdAt: Date.now(),
    };

    // 设置自动刷新定时器
    this.scheduleRefresh(expiresAt - Date.now());
  }

  /**
   * 获取 Token
   * @returns Token 或 null
   */
  get(): string | null {
    if (!this.cache) {
      return null;
    }

    // 检查是否过期
    if (Date.now() >= this.cache.expiresAt) {
      this.clear();
      return null;
    }

    return this.cache.token;
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * 检查 Token 是否即将过期（5 分钟内）
   */
  isExpiringSoon(): boolean {
    if (!this.cache) return true;
    const timeLeft = this.cache.expiresAt - Date.now();
    return timeLeft < 5 * 60 * 1000; // 5 分钟
  }

  /**
   * 获取缓存状态
   */
  getStatus(): { exists: boolean; timeLeft: number | null } {
    if (!this.cache) {
      return { exists: false, timeLeft: null };
    }

    const timeLeft = Math.max(0, this.cache.expiresAt - Date.now());
    return {
      exists: true,
      timeLeft: Math.floor(timeLeft / 1000), // 返回秒数
    };
  }

  /**
   * 安排自动刷新
   */
  private scheduleRefresh(delayMs: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // 在过期前 1 分钟触发刷新事件
    const refreshDelay = Math.max(0, delayMs - 60 * 1000);

    if (refreshDelay > 0) {
      this.refreshTimer = setTimeout(() => {
        // 这里可以触发回调，让应用主动刷新 Token
        // 实际使用中可以通过事件监听器实现
        console.log('[TokenCache] Token will expire soon, consider refreshing');
      }, refreshDelay);
    }
  }
}

/**
 * 全局 Token 缓存单例
 */
export const tokenCache = new TokenCache();

/**
 * API Key 认证守卫
 *
 * 用于保护 API 端点，只允许持有有效 API Key 的请求访问
 *
 * 使用方式：
 * - 请求头：Authorization: Bearer <api_key>
 * - 或请求头：X-API-Key: <api_key>
 */

import { config } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';

/** 认证错误类型 */
export enum AuthError {
  MISSING_KEY = 'MISSING_API_KEY',
  INVALID_KEY = 'INVALID_API_KEY',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

/**
 * 验证 API Key
 * @param apiKey 提供的 API Key
 * @returns 是否有效
 */
export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) {
    return false;
  }

  // 开发模式下，如果未配置 API keys，则跳过验证
  if (config.isDevelopment && !config.apiKeys.length) {
    console.warn('[Auth] Development mode: No API keys configured, skipping validation');
    return true;
  }

  // 验证 API Key 是否在白名单中
  return config.apiKeys.includes(apiKey);
}

/**
 * 从请求中提取 API Key
 * 支持两种格式：
 * 1. Authorization: Bearer <api_key>
 * 2. X-API-Key: <api_key>
 */
export function extractApiKey(request: NextRequest): string | null {
  // 优先从 Authorization header 获取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 其次从 X-API-Key header 获取
  return request.headers.get('x-api-key');
}

/**
 * 创建认证失败响应
 */
export function createAuthErrorResponse(error: AuthError): NextResponse {
  const messages: Record<AuthError, string> = {
    [AuthError.MISSING_KEY]: 'API Key is required',
    [AuthError.INVALID_KEY]: 'Invalid API Key',
    [AuthError.UNAUTHORIZED]: 'Unauthorized',
  };

  return NextResponse.json(
    {
      success: false,
      error: messages[error],
      error_code: error,
    },
    { status: 401 }
  );
}

/**
 * API 认证守卫中间件
 *
 * 使用示例：
 * ```ts
 * import { withAuth } from '@/lib/auth/api-guard';
 *
 * export const POST = withAuth(async (request, context) => {
 *   // 已认证的处理逻辑
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withAuth<T extends unknown[] = []>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // 提取 API Key
    const apiKey = extractApiKey(request);

    // 验证 API Key
    if (!validateApiKey(apiKey)) {
      return createAuthErrorResponse(
        apiKey ? AuthError.INVALID_KEY : AuthError.MISSING_KEY
      );
    }

    // 记录认证成功的请求（可选）
    if (config.isDevelopment) {
      console.log(`[Auth] Request authenticated with API Key: ${apiKey?.slice(0, 8)}...`);
    }

    // 执行处理函数
    return handler(request, ...args);
  };
}

/**
 * 简单的认证检查函数（用于在路由中手动调用）
 */
export function checkAuth(request: NextRequest): NextResponse | null {
  const apiKey = extractApiKey(request);

  if (!validateApiKey(apiKey)) {
    return createAuthErrorResponse(
      apiKey ? AuthError.INVALID_KEY : AuthError.MISSING_KEY
    );
  }

  return null; // 认证通过
}

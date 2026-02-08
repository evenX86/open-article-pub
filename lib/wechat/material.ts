/**
 * 微信素材管理 API 封装
 *
 * API 文档：
 * - 新增其他类型永久素材: https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/New_material_add_article.html
 */

import { config } from '../config';
import { getAccessToken } from './auth';
import { extractWechatError } from './errors';
import * as fs from 'fs';
import { Readable } from 'stream';

/** 素材类型 */
export type MaterialType = 'image' | 'thumb' | 'voice' | 'video';

/** 新增素材响应 */
export interface AddMaterialResponse {
  /** 媒体文件的 media_id */
  media_id: string;
  /** 微信素材 URL */
  url: string;
}

/**
 * 创建带文件流的 FormData
 * 使用原生 API 构建 multipart/form-data
 */
function createFormDataWithFile(filePath: string, fieldName: string = 'media'): {
  body: Buffer;
  contentType: string;
  boundary: string;
} {
  const fileBuffer = fs.readFileSync(filePath);
  const boundary = '----WebKitFormBoundary' + Date.now();

  // 根据文件扩展名确定 Content-Type
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
  };
  const contentType = contentTypeMap[ext || 'jpg'] || 'image/jpeg';

  let body = '';

  // 添加文件字段
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="${fieldName}"; filename="${filePath.split('/').pop()}"\r\n`;
  body += `Content-Type: ${contentType}\r\n\r\n`;

  const headerBuffer = Buffer.from(body, 'utf8');
  const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

  // 组合: header + file + footer
  const fullBody = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

  return {
    body: fullBody,
    contentType: `multipart/form-data; boundary=${boundary}`,
    boundary,
  };
}

/**
 * 微信素材管理器
 */
export class WechatMaterial {
  /**
   * 上传永久素材（用于获取 thumb_media_id）
   * @param filePath 文件路径
   * @param type 素材类型
   * @param accessToken 可选的 Access Token
   * @returns media_id 和 url
   */
  async addMaterial(
    filePath: string,
    type: MaterialType = 'thumb',
    accessToken?: string
  ): Promise<AddMaterialResponse> {
    // 获取 Access Token
    const token = accessToken || await getAccessToken();

    const url = new URL(`${config.apiBaseUrl}/material/add_material`);
    url.searchParams.append('access_token', token);
    url.searchParams.append('type', type);

    try {
      // 创建带文件的 FormData
      const { body, contentType } = createFormDataWithFile(filePath);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: body,
      });

      const data = (await response.json()) as AddMaterialResponse | {
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

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to add material');
    }
  }

  /**
   * 上传图片素材（便捷方法）
   * @param filePath 图片文件路径
   * @returns media_id
   */
  async uploadImage(filePath: string): Promise<string> {
    const result = await this.addMaterial(filePath, 'thumb');
    return result.media_id;
  }
}

/**
 * 全局素材管理单例
 */
let globalMaterial: WechatMaterial | null = null;

/**
 * 获取全局素材管理实例
 */
export function getMaterial(): WechatMaterial {
  if (!globalMaterial) {
    globalMaterial = new WechatMaterial();
  }
  return globalMaterial;
}

/**
 * 上传图片素材的便捷方法
 */
export async function uploadImage(filePath: string): Promise<string> {
  return getMaterial().uploadImage(filePath);
}

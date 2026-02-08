# Open Article Pub

微信公众号草稿箱 API 封装服务，支持 Markdown 转换为微信草稿。

## 功能特性

- 📝 Markdown 转 微信草稿格式
- 🔐 Access Token 自动管理和缓存
- 🎨 支持 Frontmatter 元数据
- 🚀 简洁的 REST API
- 🔒 严格的敏感信息管控

## 项目结构

```
open-article-pub/
├── lib/                      # 核心库
│   ├── wechat/              # 微信 API 封装
│   │   ├── auth.ts          # Access Token 管理
│   │   ├── draft.ts         # 草稿箱 API
│   │   ├── types.ts         # 类型定义
│   │   └── errors.ts        # 错误处理
│   ├── markdown/            # Markdown 处理
│   │   └── converter.ts     # Markdown → HTML 转换
│   ├── cache/               # 缓存管理
│   │   └── token-cache.ts   # Token 缓存
│   └── config.ts            # 配置管理
├── app/                     # Next.js App Router
│   ├── api/draft/          # 草稿 API 路由
│   └── page.tsx            # 首页
└── types/                   # 全局类型
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
WECHAT_APPID=your_appid_here
WECHAT_SECRET=your_secret_here
NODE_ENV=development
```

> **重要**: `WECHAT_APPID` 和 `WECHAT_SECRET` 可在微信公众平台获取：
> 登录公众平台 → 开发 → 基本配置

### 3. 启动服务

```bash
pnpm dev
```

服务将在 `http://localhost:3000` 启动。

## API 使用

### 新增草稿

**POST** `/api/draft`

请求体：

```json
{
  "markdown": "# 我的第一篇文章\n\n这是文章内容...",
  "title": "我的文章标题",
  "author": "张三"
}
```

响应：

```json
{
  "success": true,
  "media_id": "xxxxx"
}
```

### 使用 Frontmatter

支持在 Markdown 开头添加 YAML Frontmatter：

```markdown
---
title: 我的大标题
author: 张三
digest: 这是文章摘要
---

# 正文标题

正文内容...
```

### curl 示例

```bash
curl -X POST http://localhost:3000/api/draft \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 我的第一篇文章\n\n这是文章内容...",
    "title": "我的文章标题",
    "author": "张三"
  }'
```

## Claude Code Skill 集成

在 Claude Code 中调用：

```typescript
// 调用本地 API 创建草稿
const response = await fetch('http://localhost:3000/api/draft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: markdownContent,
    title: '文章标题',
  }),
});

const result = await response.json();
console.log('草稿 ID:', result.media_id);
```

## 安全注意事项

1. **Access Token 缓存**: Token 会在内存中缓存 7200 秒（提前 5 分钟过期）
2. **敏感信息**: `.env.local` 已加入 `.gitignore`，切勿提交
3. **IP 白名单**: 建议在微信公众平台配置服务器 IP 白名单
4. **HTTPS**: 生产环境务必使用 HTTPS

## 开发

```bash
# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## License

MIT

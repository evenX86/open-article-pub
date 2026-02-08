# Open Article Pub 项目操作手册

> **用户名：Gary** - 每次对话开头必须称呼用户为 Gary

## 🧠 记忆锚点

> [!CRITICAL] **记忆检测**
> 称呼 "Gary" → 还有记忆 | 不称呼 → 丢失记忆，需重新加载

**核心规则（必须时刻铭记）**：
1. **包管理器**：强制使用 `pnpm`（不是 npm）
2. **计划模式**：复杂任务必先规划（§7.4）
3. **信任分级**：
   - 95%：UI 组件、样式、文档
   - 80%：业务逻辑、API 路由
   - **70%**：微信认证、Token 管理、草稿操作（**必须人工审查**）
4. **知识迭代**：每次修复 bug 后更新文档

**自我检测**（不确定则需重新加载）：
- 用户名？（答案：Gary）
- 计划模式 5 项清单？
- 信任分级 70% 对应？
- 包管理器？（答案：pnpm）

---

## 核心原则

### 安全第一
- ❌ **严禁**将 `WECHAT_APPID` 和 `WECHAT_SECRET` 写入代码或提交到 Git
- ✅ **必须**通过环境变量管理敏感信息
- ✅ Access Token 仅缓存在内存中，不写入文件或数据库

### API 优先
- 所有功能通过 REST API 暴露给 Claude Code Skill
- API 设计遵循 RESTful 规范
- 统一的错误响应格式

---

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | >= 20.x LTS |
| 包管理器 | **pnpm** | >= 8.0 |
| 语言 | TypeScript | >= 5.0 |
| 框架 | Next.js | >= 15.0 |
| API 目标 | 微信公众号 API | Latest |

---

## Git 工作流

### 提交规范

**Conventional Commits**：
```bash
feat(draft): add frontmatter metadata support
fix(auth): handle token expiration gracefully
docs(api): update draft endpoint documentation
refactor(cache): extract token cache to separate module
test(converter): add markdown parsing tests
```

### 提交前检查清单

1. **Type Check**: `pnpm type-check` (0 errors)
2. **Lint**: `pnpm lint` (0 errors)
3. **Build**: `pnpm build` (验证构建无误)

### 信任校准

- **95% 信任**：UI 组件、样式调整、文档更新
- **80% 信任**：API 路由、Markdown 转换逻辑
- **70% 信任**：微信认证、Token 管理、草稿 CRUD 操作（需人工审查）

---

## AI 协作指令

### 7.1 UI 组件开发

- **风格**：简洁现代、响应式设计
- **框架**：React 19 + Next.js App Router
- **样式**：Tailwind CSS v4
- **状态管理**：Server Components 优先

### 7.2 微信 API 认证

- **约束**：Access Token 有效期 7200 秒，必须缓存
- **安全**：Token 仅存内存，提前 5 分钟过期
- **异常**：认证失败时清除缓存并重试

**Token 管理流程**：
```typescript
// 1. 尝试从缓存获取
const cached = tokenCache.get();
if (cached) return cached;

// 2. 从微信 API 获取
const token = await fetchAccessToken();

// 3. 缓存 Token（提前 5 分钟过期）
tokenCache.set(token, 7200 - 300);
```

### 7.3 草稿操作

- **约束**：必须先获取有效 Access Token
- **检查**：所有草稿操作必须记录日志
- **异常**：Token 失效时自动刷新重试

### 7.4 计划模式

对于复杂任务（多文件改动、架构调整），**必须先进入计划模式**。

**检查清单**：
1. ✅ 需求是否清晰？（不清晰先写 spec）
2. ✅ 是否影响现有 API？
3. ✅ 是否需要新的微信 API 接口？
4. ✅ 测试策略是什么？
5. ✅ 是否需要拆分成多个原子化 commit？

**重规划触发条件**：
- 🔴 实施过程中发现计划有误
- 🔴 遇到微信 API 限制或变更
- 🔴 需求发生变更

### 7.5 知识迭代机制

**每次修正错误后必须执行**：
```bash
在 `docs/` 目录下新增文档，把这个坑记下来，避免下次再犯，用中文
```

**触发场景**：
- 🔁 发现重复踩坑
- 📝 新的微信 API 限制或规则
- ⚙️ 特殊的技术约束
- 🧪 测试失败模式和解决方案

### 7.6 Subagent 协作模式

**何时使用**：
- 独立分析任务（日志分析、代码质量扫描）
- 并行开发（主会话写 API，Subagent 写测试）
- 测试验证（Subagent 跑测试，主会话继续开发）
- 文档生成（注释、文档）

**权限管理**：
- 🟢 **低权限**（自动）：读取日志、生成测试、文档更新、代码分析
- 🟡 **中权限**（确认）：修改业务逻辑、添加依赖、非破坏性 API 变更
- 🔴 **高权限**（人工审批）：修改认证逻辑、环境变量修改、部署、删除文件

### 7.7 自主 Bug 修复流程

**信任分级**：
- **95%**：UI bug → "自己决定怎么改，改完告诉我"
- **80%**：API 路由 → "分析并修复，有疑问问我"
- **70%**：微信认证、Token 管理 → "先分析问题，给方案，等我确认后再执行"

### 7.8 Markdown 转换规范

**支持的功能**：
- 标题（h1-h6）
- 粗体、斜体
- 链接
- 图片（需先上传到微信素材库）
- 列表
- 代码块
- 引用

**转换规则**：
```typescript
// 输入 Markdown
# 标题

**粗体**和*斜体*

[链接](https://example.com)

// 输出 HTML
<h1>标题</h1>
<p><strong>粗体</strong>和<em>斜体</em></p>
<p><a href="https://example.com">链接</a></p>
```

### 7.9 Frontmatter 元数据

**支持的字段**：
```yaml
---
title: 文章标题
author: 作者
digest: 摘要（单图文）
contentSourceUrl: 阅读原文链接
thumbMediaId: 封面图片素材 ID
---
```

**优先级**：API 参数 > Frontmatter > 第一个标题

### 7.10 API 数据访问层规范

**核心原则**：页面组件不得直接调用微信 API，必须通过 API 路由。

**架构分层**：
```
┌─────────────────────────────────────┐
│  Claude Code Skill                  │  外部调用者
├─────────────────────────────────────┤
│  API Routes (app/api/)              │  REST API 层
├─────────────────────────────────────┤
│  Business Logic (lib/wechat/)       │  业务逻辑层
├─────────────────────────────────────┤
│  WeChat API                         │  微信 API
└─────────────────────────────────────┘
```

**规则清单**：
1. ❌ **禁止**：在 `app/` 目录下直接调用 `lib/wechat/`
2. ✅ **必须**：在 `app/api/` 创建 API 路由
3. ✅ **统一**：返回 `{ success, data?, error? }` 结构
4. ✅ **记录**：关键 API 调用必须记录日志

**正确模式**（推荐）：
```typescript
// app/api/draft/route.ts ✅ 正确：API 路由层
import { addDraft } from '@/lib/wechat/client';

export async function POST(request: NextRequest) {
  try {
    const mediaId = await addDraft(article);
    return NextResponse.json({ success: true, media_id: mediaId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
```

---

## 微信 API 参考

### Access Token 获取
- 文档：https://developers.weixin.qq.com/miniprogram/dev/server/API/mp-access-token/api_getaccesstoken.html
- 接口：`GET https://api.weixin.qq.com/cgi-bin/token`
- 有效期：7200 秒

### 新增草稿
- 文档：https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_add.html
- 接口：`POST https://api.weixin.qq.com/cgi-bin/draft/add`
- 参数：`articles` 数组

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 40001 | access_token 无效 | 刷新 Token |
| 40164 | IP 不在白名单 | 在公众平台配置 IP 白名单 |
| 40243 | AppSecret 已冻结 | 解冻 AppSecret |

---

## 开发环境设置

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 WECHAT_APPID 和 WECHAT_SECRET

# 3. 启动开发服务器
pnpm dev
```

### API 测试

```bash
# 测试新增草稿
curl -X POST http://localhost:3000/api/draft \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 测试文章\n\n内容...",
    "title": "测试标题"
  }'
```

---

**最后更新**: 2026-02-08
**维护者**: Pengyu

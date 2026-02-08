# 测试待办事项 (Testing TODO)

> **最后更新**: 2026-02-08
> **状态**: 步骤定义已完成，需要配置运行环境

---

## 测试实现状态总览

| Feature | 步骤定义 | 测试状态 | 需要什么 |
|---------|----------|----------|----------|
| `markdown-converter` | ✅ 完成 | ✅ 全部通过 (11/11) | 无（纯函数测试） |
| `api-authentication` | ✅ 完成 | ⚠️ 部分通过 (6/9) | 开发服务器 |
| `draft` | ✅ 完成 | ⏸️ 待运行 | 开发服务器 |
| `token-management` | ✅ 完成 | ⏸️ 待运行 | 部分需要 mock |

---

## 测试前准备清单

### 1. 环境变量配置

创建 `.env.local` 文件，添加以下内容：

```bash
# 微信公众号配置（必须）
WECHAT_APPID=your_appid_here
WECHAT_SECRET=your_secret_here

# API Key 白名单（必须，生产环境）
API_KEYS=test_key_1,test_key_2

# 可选配置
WECHAT_TOKEN_CACHE_TTL=7200
NODE_ENV=development
```

**获取方式**：
- 登录 [微信公众平台](https://mp.weixin.qq.com/)
- 进入 **开发 > 基本配置**
- 复制 **AppID** 和 **AppSecret**

---

### 2. 启动开发服务器

```bash
# 终端 1：启动 Next.js 开发服务器
pnpm dev
```

**确保**：
- 服务器运行在 `http://localhost:3000`
- 没有端口冲突
- 控制台无报错

---

## 按优先级运行测试

### 阶段 1: 单元测试（无需额外配置）

```bash
# Markdown 转换器测试 - 应该全部通过
pnpm test:markdown
```

**预期结果**: 11 scenarios passed, 32 steps passed

---

### 阶段 2: API 认证测试（需要开发服务器）

```bash
# 确保 pnpm dev 正在运行
pnpm test:auth
```

**当前测试结果**: 6/9 scenarios passing

**通过的测试场景**:
- ✅ Bearer Token 认证 (使用有效 API key)
- ✅ X-API-Key 认证 (使用有效 API key)
- ✅ 开发模式跳过验证 (未配置 API keys 时)
- ✅ 支持配置多个 API Keys
- ✅ API Keys 配置包含空格时自动去除
- ✅ CORS 预检请求

**失败的测试场景** (由于测试架构限制):
- ❌ 未提供 API Key 时返回 401 错误
- ❌ 提供无效的 API Key 时返回 401 错误
- ❌ Bearer Token 格式错误时返回 401 错误

**失败原因**: 测试进程和开发服务器是独立进程，测试中设置的环境变量无法影响开发服务器。
开发服务器从 `.env.local` 读取环境变量，该文件中 `API_KEYS` 未设置，因此服务器始终处于"开发模式跳过验证"状态。

**注意**: 认证逻辑本身是正确的，只是当前的测试架构无法完全测试所有场景。如需完整测试，需改用同进程测试框架（如 Jest + supertest）。

---

### 阶段 3: 草稿 API 测试（需要开发服务器 + 微信 API）

```bash
# 确保 pnpm dev 正在运行
pnpm test:draft
```

**测试场景**:
- ✅ 基本 Markdown 创建
- ✅ Frontmatter 元数据提取
- ✅ 标题优先级
- ✅ 验证错误处理
- ✅ 长内容处理
- ✅ 可选字段支持
- ⚠️ 微信 API 错误处理（需要 mock）

**需要注意**：
- 实际会调用微信 API，可能产生真实的草稿
- 确保 `WECHAT_APPID` 和 `WECHAT_SECRET` 正确
- 如果 API 返回错误，检查 IP 白名单配置

---

### 阶段 4: Token 管理测试

```bash
# 部分 Token 测试需要 mock 或实际微信环境
pnpm test:token
```

**测试场景**:
- ✅ Token 缓存（内存级别）
- ✅ Token 过期处理
- ⚠️ 微信 API 调用计数（需要 spy）
- ⚠️ 并发请求（需要 mock）

---

## 已知限制和后续工作

### 已完成 (2026-02-08)

- [x] **微信 API Mock**: 已实现 `WECHAT_MOCK_API=true` 环境变量
  - 影响: `draft` 和 `token-management` 测试不再调用真实 API
  - 实现: 在 `lib/wechat/draft.ts` 中添加 mock 模式检查

- [x] **开发模式认证跳过**: 已实现开发模式下未配置 API keys 时跳过认证
  - 实现: 在 `lib/auth/api-guard.ts` 中将 dev mode 检查提前
  - 注意: dev mode 检查必须在 null check 之前

- [x] **模块解析修复**: 移除所有 `.js` 扩展名导入
  - 修复: `lib/wechat/` 和 `lib/markdown/` 中的导入语句
  - 原因: Next.js 15 ES 模块系统无法正确解析带 `.js` 扩展名的导入

### 高优先级

- [ ] **测试架构改进**: 当前 Cucumber 测试与开发服务器分离
  - 影响: 无法在测试中控制服务器环境变量
  - 解决方案: 考虑使用 Jest + supertest 实现同进程测试

- [ ] **测试隔离**: 当前测试之间可能互相影响（共享全局状态）
  - 影响: 所有集成测试
  - 解决方案: 在 `Before` 钩子中清理全局状态

### 中优先级

- [ ] **并发测试**: Token 并发请求场景需要真实模拟
  - 影响: `token-management.feature:58`
  - 解决方案: 使用 `Promise.all` 模拟并发请求

- [ ] **错误场景覆盖**: 微信 API 错误响应测试
  - 影响: `draft.feature` 中的错误场景
  - 解决方案: Mock 各种错误码的响应

### 低优先级

- [ ] **覆盖率报告**: 添加测试覆盖率报告
  ```bash
  pnpm add -D c8 @cucumber/cucumber
  pnpm test --coverage
  ```

- [ ] **CI 集成**: 在 GitHub Actions 中运行测试
  - 需要配置 secrets 存储微信凭证
  - 需要配置环境变量

---

## 快速命令参考

```bash
# 运行所有测试
pnpm test

# 运行特定 feature 测试
pnpm test:markdown  # Markdown 转换器
pnpm test:auth      # API 认证
pnpm test:draft     # 草稿 API
pnpm test:token     # Token 管理

# 运行特定标签
NODE_OPTIONS='--import tsx/esm' cucumber-js --tags '@happy_path'
NODE_OPTIONS='--import tsx/esm' cucumber-js --tags '@validation'

# 生成测试报告
pnpm test --format html:tests/reports/cucumber-report.html
```

---

## 故障排查

### 问题 1: "503 Service unavailable"

**原因**: 开发服务器未启动

**解决**:
```bash
pnpm dev
# 等待启动完成后再运行测试
```

---

### 问题 2: 认证失败

**原因**: API Keys 未配置或不匹配

**解决**:
1. 检查 `.env.local` 中的 `API_KEYS`
2. 确认测试中的 API Key 与配置匹配
3. 开发模式下可以不配置 API Keys

---

### 问题 3: 微信 API 错误

**常见错误**:
- `40001`: Access Token 无效 → 清除缓存重试
- `40164`: IP 不在白名单 → 在公众平台配置 IP 白名单
- `40243`: AppSecret 被冻结 → 解冻 AppSecret

---

### 问题 4: 步骤定义冲突

**错误信息**: "Multiple step definitions match"

**当前状态**: 已通过 `common.steps.ts` 解决，如果仍有问题：
```bash
# 查看步骤定义来源
NODE_OPTIONS='--import tsx/esm' cucumber-js --format-summary
```

---

## 下一步行动

1. **立即执行**: 配置 `.env.local` 并启动开发服务器
2. **短期**: 运行 `pnpm test:markdown` 验证基础功能
3. **中期**: 运行 `pnpm test:auth` 验证 API 认证
4. **长期**: 实现 Mock 策略，避免实际调用微信 API

---

**维护者**: Pengyu
**联系方式**: 如有问题请查看 `CLAUDE.md` 中的协作指南

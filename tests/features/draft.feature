# 语言：中文
# 基于微信草稿箱 API 的场景测试

@wechat_draft @smoke
功能: 新增草稿 - Markdown 转微信草稿

  作为 Claude Code Skill 的使用者
  我希望将 Markdown 内容转换为微信公众号草稿
  以便快速在微信公众平台编辑和发布

  背景:
    假设系统已正确配置微信 AppID 和 AppSecret
    并且 Access Token 有效且未过期
    并且已提供有效的 API Key（生产环境必须）

  @happy_path
  场景: 使用最简单的 Markdown 创建草稿成功
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 我的第一篇文章\n\n这是文章内容。",
        "title": "我的第一篇文章"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true
    并且响应体中应包含 "media_id"

  @happy_path @frontmatter
  场景: 从 Frontmatter 提取元数据创建草稿
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "---\\ntitle: 从 Frontmatter 提取的标题\\nauthor: 张三\\ndigest: 这是摘要\\n---\\n\\n# 正文标题\\n\\n正文内容"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true
    并且响应体中应包含 "media_id"

  @happy_path @title_fallback
  场景: 标题来源优先级 - API 参数 > Frontmatter > 第一个 h1
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 第一个 H1 标题\\n\\n正文内容",
        "title": "API 参数标题"
      }
      """
    那么响应状态码应为 200
    并且草稿标题应为 "API 参数标题"

  @happy_path @title_fallback
  场景: 标题来源优先级 - Frontmatter > 第一个 h1（无 API 参数）
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "---\\ntitle: Frontmatter 标题\\n---\\n\\n# 第一个 H1 标题\\n\\n正文内容"
      }
      """
    那么响应状态码应为 200
    并且草稿标题应为 "Frontmatter 标题"

  @happy_path @title_fallback
  场景: 标题来源优先级 - 使用第一个 h1 作为后备
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 第一个 H1 标题\\n\\n正文内容"
      }
      """
    那么响应状态码应为 200
    并且草稿标题应为 "第一个 H1 标题"

  @validation
  场景: 缺少必填字段 markdown 时返回 400 错误
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "title": "只有标题"
      }
      """
    那么响应状态码应为 400
    并且响应体中 "success" 应为 false
    并且响应体中 "error" 应包含 "markdown is required"

  @validation @title_missing
  场景: 无法提取标题时返回 400 错误
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "这是一段没有标题的正文内容，也没有 h1"
      }
      """
    那么响应状态码应为 400
    并且响应体中 "success" 应为 false
    并且响应体中 "error" 应包含 "title is required"

  @validation
  场景: 请求体不是有效 JSON 时返回 400 错误
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      这不是有效的 JSON {invalid
      """
    那么响应状态码应为 400

  @wechat_api_error @auth
  场景: Access Token 无效时返回微信错误信息
    假设 Access Token 已失效
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试"
      }
      """
    那么响应状态码应为 400
    并且响应体中 "success" 应为 false
    并且响应体中 "error" 应包含 "WeChat API Error"

  @wechat_api_error @rate_limit
  场景: 超过微信 API 调用频率限制时返回错误
    假设微信 API 返回频率限制错误
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试"
      }
      """
    那么响应状态码应为 400
    并且响应体中 "error" 应包含频率相关信息

  @markdown_conversion @formatting
  场景: Markdown 基础格式正确转换为 HTML
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 标题\\n\\n这是**粗体**和*斜体*。\\n\\n- 列表项1\\n- 列表项2\\n\\n[链接](https://example.com)",
        "title": "格式测试"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @markdown_conversion @code_block
  场景: Markdown 代码块正确转换
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 代码示例\\n\\n```javascript\\nconst x = 1;\\nconsole.log(x);\\n```",
        "title": "代码测试"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @edge_case @special_characters
  场景: 包含特殊字符的 Markdown 正确处理
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 特殊字符测试\\n\\n包含引号 \\"双引号\\" 和单引号 \\'单引号\\'\\n\\n包含 & < > 等字符\\n\\n包含中文标点：，。！？",
        "title": "特殊字符"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @edge_case @long_content
  场景: 内容接近微信限制（2万字符）时正常处理
    假设正文内容为 19000 个字符
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 长文章\\n\\n" + "内容。".repeat(3000),
        "title": "长内容测试"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @edge_case @long_content @validation
  场景: 内容超过微信限制（2万字符）时返回错误
    假设正文内容超过 20000 个字符
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 超长文章\\n\\n" + "内容。".repeat(4000),
        "title": "超长内容"
      }
      """
    那么响应状态码应为 400
    或者微信 API 返回内容超限错误

  @optional_fields
  场景: 传递所有可选字段时正确创建草稿
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 完整示例\\n\\n正文内容",
        "title": "完整标题",
        "author": "张三",
        "digest": "这是摘要",
        "contentSourceUrl": "https://example.com/article",
        "thumbMediaId": "media_id_xxx",
        "needOpenComment": 1,
        "onlyFansCanComment": 0
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true
    并且响应体中应包含 "media_id"

  @edge_case @empty_content
  场景: Markdown 只有标题没有正文时仍可创建
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 只有标题",
        "title": "空内容测试"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @cors
  场景: OPTIONS 预检请求正确处理 CORS
    当我发送 OPTIONS 请求到 "/api/draft"
    那么响应状态码应为 200
    并且响应头应包含 "Access-Control-Allow-Origin"

---

# 示例映射总结

## 标题来源优先级规则

| 优先级 | 来源 | 示例输入 | 结果标题 |
|--------|------|----------|----------|
| 1 | API 参数 `title` | `{"title": "API标题", "markdown": "# H1标题"}` | "API标题" |
| 2 | Frontmatter `title` | `{"markdown": "---\ntitle: FM标题\n---\n\n# H1标题"}` | "FM标题" |
| 3 | 第一个 H1 | `{"markdown": "# H1标题"}` | "H1标题" |
| - | 无标题 | `{"markdown": "无标题内容"}` | 400 错误 |

## Access Token 缓存规则

| 场景 | Token 状态 | 系统行为 |
|------|------------|----------|
| 首次获取 | 缓存为空 | 调用微信 API 获取 Token |
| 正常使用 | 距过期 > 5 分钟 | 使用缓存 Token |
| 即将过期 | 距过期 ≤ 5 分钟 | 刷新 Token |
| 已过期 | 已过过期时间 | 清除缓存，重新获取 |
| API 返回 40001 | Token 无效 | 清除缓存，重新获取并重试 |

## 内容长度限制

| 内容类型 | 限制 | 超限行为 |
|----------|------|----------|
| 标题 | ≤ 32 字 | 微信 API 返回错误 |
| 作者 | ≤ 16 字 | 微信 API 返回错误 |
| 摘要 | ≤ 128 字 | 微信 API 返回错误 |
| 正文 | ≤ 20,000 字且 < 1MB | 微信 API 返回错误 |

## 信任分级与自动化

| 信任度 | 操作类型 | 可自动执行 | 需人工审查 |
|--------|----------|------------|------------|
| 95% | UI 组件、样式、文档 | ✅ | - |
| 80% | API 路由、业务逻辑 | ✅ | - |
| 70% | 微信认证、Token 管理 | - | ✅ |

# 语言：中文
# API Key 认证场景

@api_auth @security
功能: API Key 认证

  作为系统
  我需要验证 API 请求的合法性
  以防止未授权的访问

  背景:
    假设系统已正确配置微信 AppID 和 AppSecret
    并且 Access Token 有效且未过期

  @happy_path @bearer_token
  场景: 使用有效的 Bearer Token 访问 API
    假设环境变量 API_KEYS 包含 "valid_key_123"
    当我发送 POST 请求到 "/api/draft"，请求头为:
      """
      Authorization: Bearer valid_key_123
      """
      并且请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @happy_path @x_api_key
  场景: 使用有效的 X-API-Key 访问 API
    假设环境变量 API_KEYS 包含 "valid_key_456"
    当我发送 POST 请求到 "/api/draft"，请求头为:
      """
      X-API-Key: valid_key_456
      """
      并且请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @validation @missing_api_key
  场景: 未提供 API Key 时返回 401 错误
    假设环境变量 API_KEYS 包含 "valid_key_123"
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 401
    并且响应体中 "success" 应为 false
    并且响应体中 "error" 应为 "API Key is required"
    并且响应体中 "error_code" 应为 "MISSING_API_KEY"

  @validation @invalid_api_key
  场景: 提供无效的 API Key 时返回 401 错误
    假设环境变量 API_KEYS 包含 "valid_key_123"
    当我发送 POST 请求到 "/api/draft"，请求头为:
      """
      Authorization: Bearer invalid_key
      """
      并且请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 401
    并且响应体中 "success" 应为 false
    并且响应体中 "error" 应为 "Invalid API Key"
    并且响应体中 "error_code" 应为 "INVALID_API_KEY"

  @validation @malformed_bearer_token
  场景: Bearer Token 格式错误时返回 401 错误
    假设环境变量 API_KEYS 包含 "valid_key_123"
    当我发送 POST 请求到 "/api/draft"，请求头为:
      """
      Authorization: invalid_key_123
      """
      并且请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 401
    并且响应体中 "success" 应为 false
    并且响应体中 "error_code" 应为 "MISSING_API_KEY"

  @happy_path @dev_mode_skip_auth
  场景: 开发模式未配置 API Keys 时跳过验证
    假设环境变量 NODE_ENV 为 "development"
    并且环境变量 API_KEYS 未配置或为空
    当我发送 POST 请求到 "/api/draft"，请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @validation @multiple_api_keys
  场景: 支持配置多个 API Keys
    假设环境变量 API_KEYS 包含 "key1,key2,key3"
    当我发送 POST 请求到 "/api/draft"，请求头为:
      """
      Authorization: Bearer key2
      """
      并且请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @edge_case @whitespace_in_keys
  场景: API Keys 配置包含空格时自动去除
    假设环境变量 API_KEYS 包含 "key1 , key2 ,key3"
    当我发送 POST 请求到 "/api/draft"，请求头为:
      """
      Authorization: Bearer key2
      """
      并且请求体为:
      """
      {
        "markdown": "# 测试\\n\\n内容",
        "title": "测试标题"
      }
      """
    那么响应状态码应为 200
    并且响应体中 "success" 应为 true

  @cors
  场景: OPTIONS 请求包含认证相关的 CORS 头
    当我发送 OPTIONS 请求到 "/api/draft"
    那么响应状态码应为 200
    并且响应头应包含 "Access-Control-Allow-Headers"
    并且 "Access-Control-Allow-Headers" 应包含 "Authorization"
    并且 "Access-Control-Allow-Headers" 应包含 "X-API-Key"

# -----------------------------------------------------------------------------
# API 认证规则总结（文档说明）
#
# ## 认证方式
# - Authorization: Bearer key123 (优先)
# - X-API-Key: key123 (备选)
#
# ## 环境行为
# - development + 未配置 API_KEYS: 跳过认证
# - development + 已配置 API_KEYS: 验证 API Key
# - production + 未配置 API_KEYS: 拒绝所有请求
# - production + 已配置 API_KEYS: 验证 API Key
#
# ## 错误码
# - MISSING_API_KEY: 401, "API Key is required"
# - INVALID_API_KEY: 401, "Invalid API Key"
#
# ## API Key 格式
# - 支持逗号分隔: key1,key2,key3
# - 自动去除空格: "key1 , key2" → ["key1", "key2"]
# -----------------------------------------------------------------------------

# 以上为文档说明，以下是测试场景定义

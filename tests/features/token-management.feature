# 语言：中文
# Access Token 管理与缓存场景

@wechat_auth @token_management
功能: Access Token 管理与缓存

  作为系统
  我需要自动管理 Access Token
  以避免频繁调用微信 Token 接口

  背景:
    假设系统已正确配置微信 AppID 和 AppSecret

  @happy_path @token_fetch
  场景: 首次获取 Access Token
    当系统需要调用微信 API
    并且内存缓存中无有效 Token
    那么系统应调用微信 Token 接口
    并且获取的 Token 应存入内存缓存
    并且缓存过期时间应设置为 7200 秒减去 5 分钟缓冲

  @happy_path @token_cache
  场景: 缓存有效时直接使用缓存 Token
    假设内存缓存中存在未过期的 Access Token
    当系统需要调用微信 API
    那么系统应直接使用缓存 Token
    并且不应调用微信 Token 接口

  @edge_case @token_expire
  场景: Token 即将过期时自动刷新
    假设内存缓存中的 Token 距离过期少于 5 分钟
    当系统需要调用微信 API
    那么系统应刷新 Token
    并且新 Token 应覆盖旧缓存

  @edge_case @token_expired
  场景: Token 已过期时清除缓存并重新获取
    假设内存缓存中的 Token 已过期
    当系统需要调用微信 API
    那么系统应清除过期缓存
    并且重新调用微信 Token 接口获取新 Token

  @wechat_api_error @token_invalid
  场景: 微信 API 返回 Token 无效错误时自动刷新
    假设微信 API 返回错误码 40001（invalid credential）
    当系统调用草稿接口失败
    那么系统应清除当前 Token 缓存
    并且重新获取 Token 后重试请求

  @security
  场景: Token 不会持久化到文件或数据库
    当系统获取到新的 Access Token
    那么 Token 应仅存储在内存中
    并且不应写入任何文件
    并且不应存储到数据库

  @concurrent
  场景: 多个并发请求共享同一个 Token 缓存
    假设内存缓存中存在有效的 Access Token
    当系统同时收到 10 个草稿创建请求
    那么所有请求应使用同一个缓存的 Token
    并且只应调用微信 Token 接口 0 次

  @configuration
  场景: 缓存过期时间可配置
    假设环境变量 WECHAT_TOKEN_CACHE_TTL 设置为 3600
    当系统获取新的 Access Token
    那么缓存过期时间应设置为 3600 秒减去 5 分钟缓冲

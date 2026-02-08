# 语言：中文
# Markdown 转 HTML 转换场景

@markdown_parser
功能: Markdown 转 HTML 转换

  作为系统
  我需要将 Markdown 转换为微信支持的 HTML 格式
  以便正确显示文章内容

  @happy_path @headings
  场景: 正确转换各级标题
    假设输入 Markdown 为 "# H1\n\n## H2\n\n### H3"
    那么输出应包含 "<h1>H1</h1>"
    并且输出应包含 "<h2>H2</h2>"
    并且输出应包含 "<h3>H3</h3>"

  @happy_path @text_formatting
  场景: 正确转换粗体和斜体
    假设输入 Markdown 为 "这是**粗体**和*斜体*"
    那么输出应包含 "<strong>粗体</strong>"
    并且输出应包含 "<em>斜体</em>"

  @happy_path @links
  场景: 正确转换链接
    假设输入 Markdown 为 "[Google](https://google.com)"
    那么输出应包含 '<a href="https://google.com">Google</a>'

  @happy_path @images
  场景: 正确转换图片标记
    假设输入 Markdown 为 "![alt](https://example.com/img.jpg)"
    那么输出应包含 '<img src="https://example.com/img.jpg" alt="alt"'

  @happy_path @lists
  场景: 正确转换无序列表
    假设输入 Markdown 为 "- 项目1\n- 项目2\n- 项目3"
    那么输出应包含 "<ul>"
    并且输出应包含 "<li>项目1</li>"
    并且输出应包含 "<li>项目2</li>"
    并且输出应包含 "<li>项目3</li>"

  @happy_path @code_blocks
  场景: 正确转换代码块
    假设输入 Markdown 为 "```js\nconst x = 1;\n```"
    那么输出应包含 "<pre><code>const x = 1;\n</code></pre>"

  @happy_path @inline_code
  场景: 正确转换行内代码
    假设输入 Markdown 为 "这是`行内代码`示例"
    那么输出应包含 "<code>行内代码</code>"

  @edge_case @escape_html
  场景: 正确转义 HTML 特殊字符
    假设输入 Markdown 为 "包含 <div> 标签"
    那么 < 应被转义为 "&lt;"
    并且 > 应被转义为 "&gt;"

  @edge_case @mixed_formatting
  场景: 正确处理混合格式
    假设输入 Markdown 为 "**粗体**包含`代码`和*斜体*"
    那么输出应包含 "<strong>粗体</strong>包含<code>代码</code>和<em>斜体</em>"

  @wechat_compatibility
  场景: 过滤微信不支持的标签
    假设输入 Markdown 包含脚本标签
    那么输出不应包含 "<script>"
    并且输出不应包含 "<style>"
    并且输出不应包含 "<iframe>"

  @wechat_compatibility @class_attributes
  场景: 保留基础标签但移除 class 属性
    假设输入 Markdown 转换后包含 '<p class="text-lg">内容</p>'
    那么输出应为 '<p>内容</p>'
    并且 class 属性应被移除

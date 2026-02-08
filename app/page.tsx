export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Open Article Pub</h1>
      <p>微信公众号草稿箱 API 服务</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>API 端点</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>POST /api/draft</strong> - 新增草稿
          </li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>请求示例</h2>
        <pre style={{
          background: 'rgba(0,0,0,0.1)',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
{`curl -X POST http://localhost:3000/api/draft \\
  -H "Content-Type: application/json" \\
  -d '{
    "markdown": "# 我的文章\\n\\n这是文章内容...",
    "title": "我的文章标题",
    "author": "作者名"
  }'`}
        </pre>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>配置</h2>
        <p>请设置以下环境变量：</p>
        <ul style={{ lineHeight: '1.8' }}>
          <li><code>WECHAT_APPID</code> - 微信 AppID</li>
          <li><code>WECHAT_SECRET</code> - 微信 AppSecret</li>
        </ul>
      </section>
    </main>
  );
}

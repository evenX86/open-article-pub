// Cucumber 配置文件
// 使用 commonjs 格式以兼容 @cucumber/cucumber

module.exports = {
  default: {
    // 指定 feature 文件路径
    paths: ['tests/features/**/*.feature'],
    // 指定步骤定义文件路径
    import: ['tests/hooks.ts', 'tests/steps/**/*.ts'],
    // 格式化输出
    format: [
      '@cucumber/pretty-formatter',
      'html:tests/reports/cucumber-report.html',
      'json:tests/reports/cucumber-report.json',
    ],
    // 禁用并行执行（简化调试）
    parallel: 0,
    // 支持中文关键词
    language: 'zh-CN',
  },
};

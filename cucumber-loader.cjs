// Cucumber 自定义加载器 - 使用 tsx 处理 TypeScript
// 这个脚本作为 Node.js 加载器，允许 Cucumber 直接运行 TypeScript 文件

const { register } = require('tsx/cjs');

// 注册 tsx 加载器
register({
  // tsx 配置
  tsconfig: './tsconfig.json',
});

// tsx 会自动处理后续的 TypeScript 导入

import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

// 博客项目 Astro 配置文件
const isBuild = process.env.NODE_ENV === 'production' || process.argv.includes('build');

export default defineConfig({
  // Gitee Pages 地址；本地开发不带子路径，构建部署时加仓库名
  site: isBuild ? 'https://qqleo.gitee.io/qq_web_blog' : 'http://localhost:4321',
  base: isBuild ? '/qq_web_blog' : '/',

  // 开发服务器配置
  devToolbar: {
    enabled: false, // 关闭开发工具栏，让页面更干净
  },

  // Vite 配置：设置路径别名，让 import 语句更简洁
  vite: {
    resolve: {
      alias: {
        '@components': fileURLToPath(
          new URL('./src/components', import.meta.url),
        ),
        '@layouts': fileURLToPath(
          new URL('./src/layouts', import.meta.url),
        ),
        '@utils': fileURLToPath(
          new URL('./src/utils', import.meta.url),
        ),
        '@config': fileURLToPath(
          new URL('./src/config', import.meta.url),
        ),
        '@styles': fileURLToPath(
          new URL('./src/styles', import.meta.url),
        ),
      },
    },
  },
});

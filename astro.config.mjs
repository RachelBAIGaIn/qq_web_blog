import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

// 博客项目 Astro 配置文件
// 新手通常不需要修改这个文件
export default defineConfig({
  // 网站部署的根路径，部署到域名根目录时使用 "/"
  site: 'https://example.com',

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

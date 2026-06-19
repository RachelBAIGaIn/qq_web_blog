/**
 * 导航菜单配置
 *
 * 新手修改指南：
 * - 修改 text 改菜单显示文字
 * - 修改 href 改点击后跳转的地址
 * - 新增一项即可增加导航菜单
 * - 删除一项即可移除导航菜单
 * - href 对应的页面需要在 src/pages/ 下存在
 */
export interface NavItem {
  text: string;
  href: string;
}

export const navItems: NavItem[] = [
  { text: '首页', href: '/' },
  { text: '生活', href: '/life/' },
  { text: 'AI 资讯', href: '/ai-news/' },
  { text: '学习', href: '/skills/' },
  { text: '项目', href: '/projects/' },
  { text: '搜索', href: '/search/' },
  { text: '关于我', href: '/about/' },
];

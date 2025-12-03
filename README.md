# NewTab - 自定义新标签页扩展

一个功能丰富的浏览器新标签页扩展，使用 React + Vite + TypeScript + Tailwind CSS 构建。

## 功能特性

### 核心功能
- **时间显示**: 左上角数字时钟 + 日期星期
- **搜索框**: 支持多搜索引擎切换，搜索历史记录
- **一言**: 右上角显示随机一言，支持分类筛选
- **网站卡片**: 快捷访问常用网站，支持分组管理
- **天气显示**: 自动获取当前位置天气（可选）

### 增强功能
- **拖拽排序**: 网站卡片支持拖拽重新排序
- **右键菜单**: 快速编辑、删除、移动卡片
- **书签导入**: 从浏览器书签一键导入
- **待办事项**: 内置简易待办清单（可选）
- **便签**: 快捷笔记功能（可选）

### 个性化设置
- **主题**: 深色/浅色/跟随系统
- **自定义主题色**
- **壁纸**: Bing每日/Unsplash/本地图片/纯色
- **卡片样式**: 圆角程度、透明度可调
- **搜索引擎**: 支持添加自定义搜索引擎

### 数据管理
- **本地备份**: JSON格式导入导出
- **WebDAV同步**: 支持 WebDAV 云端备份

## 安装使用

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 加载扩展

1. 运行 `npm run build` 构建项目
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目的 `dist` 文件夹

### 生成图标

构建前需要生成 PNG 图标文件：

```bash
node scripts/generate-icons.js
```

或手动将 `public/icons/icon.svg` 转换为 16x16、48x48、128x128 的 PNG 文件。

## 项目结构

```
NewTab/
├── public/
│   ├── manifest.json          # 扩展清单
│   └── icons/                 # 扩展图标
├── src/
│   ├── components/            # React 组件
│   │   ├── Header/            # 顶部组件（时钟、搜索、一言）
│   │   ├── Cards/             # 卡片组件
│   │   ├── Modals/            # 模态框组件
│   │   └── Widgets/           # 小组件（待办、便签）
│   ├── hooks/                 # 自定义 Hooks
│   ├── stores/                # Zustand 状态管理
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   ├── App.tsx                # 主应用组件
│   └── main.tsx               # 入口文件
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **Framer Motion** - 动画效果
- **@dnd-kit** - 拖拽排序
- **Lucide React** - 图标库

## 快捷键

- `/` - 聚焦搜索框
- `Enter` - 执行搜索
- `↑` `↓` - 搜索历史导航
- `Esc` - 关闭下拉菜单

## License

MIT

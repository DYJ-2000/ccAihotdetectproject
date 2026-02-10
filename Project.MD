# AI 热点检测工具 - 项目文档

## 项目概述
一个基于 React + Express + Prisma 的 AI 热点检测工具，支持通过 OpenRouter、GitHub API 和 Twitter API 获取和分析热点内容。

## 项目类型
- **项目性质**：全栈 Web 应用（React 前端 + Express 后端）
- **当前阶段**：开发完成（可运行状态）

## 技术栈

### 前端
- React 18
- Vite
- TailwindCSS
- React Router
- Lucide React (图标)

### 后端
- Express
- Prisma ORM
- SQLite
- OpenRouter API
- GitHub API
- Twitter API (可选)

## 项目结构

### 根目录
```
d:\ccAihotproject\
├── .git/                 # Git 仓库
├── .gitignore           # Git 忽略文件
├── .vscode/            # VSCode 配置
├── backend/            # 后端应用
├── frontend/           # 前端应用
├── README.md           # 项目文档
├── Project.MD          # 项目详细文档（当前文件）
├── start.bat           # 启动脚本
└── stop.bat            # 停止脚本
```

### Backend 目录
```
backend/
├── .env               # 环境变量（包含敏感信息）
├── .env.example       # 环境变量模板
├── package.json       # 后端依赖配置
├── prisma/           # Prisma 配置
│   ├── dev.db        # SQLite 数据库文件
│   ├── migrations/   # 数据库迁移文件
│   └── schema.prisma # 数据库模式定义
└── src/              # 后端源代码
    ├── controllers/  # 控制器
    ├── middleware/   # 中间件
    ├── models/       # 数据模型
    ├── routes/       # 路由定义
    ├── services/     # 业务逻辑服务
    └── utils/        # 工具函数
        └── index.js  # 入口文件
```

### Frontend 目录
```
frontend/
├── package.json      # 前端依赖配置
├── src/             # 前端源代码
│   ├── App.jsx      # 主应用组件
│   ├── components/  # 可复用组件
│   ├── contexts/    # React Context
│   ├── hooks/       # 自定义 Hooks
│   ├── pages/       # 页面组件
│   ├── services/    # API 服务
│   └── store/       # 状态管理
├── index.html       # HTML 模板
├── tailwind.config.js # TailwindCSS 配置
└── vite.config.js   # Vite 构建配置
```

## 功能特性

### 仪表盘
- 显示热点统计信息（总热点数、活跃关键词、未读通知、24小时热点）
- 最新热点列表展示
- 来源分布统计

### 关键词管理
- 添加/删除监控关键词
- 启用/禁用关键词
- 选择数据源（OpenRouter/Twitter/全部）

### 搜索
- 手动搜索热点内容
- 支持按标题和内容搜索
- 显示搜索结果详情

### 立即检查
- 手动触发热点抓取
- 显示检查历史记录
- 实时检查状态反馈

### 通知系统
- 右上角通知铃铛
- 实时推送新热点通知
- 标记已读/全部已读

## 数据库结构

### Keyword（关键词）
- `id` - 唯一标识
- `keyword` - 关键词内容
- `isActive` - 是否启用
- `source` - 数据源（OpenRouter/Twitter/Both）
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### Hotspot（热点）
- `id` - 唯一标识
- `title` - 标题
- `content` - 内容
- `source` - 来源（OpenRouter/Twitter）
- `sourceUrl` - 原始链接
- `relevanceScore` - 相关度评分
- `matchedKeywords` - 匹配的关键词（JSON）
- `publishedAt` - 发布时间
- `createdAt` - 创建时间

### Notification（通知）
- `id` - 唯一标识
- `hotspotId` - 关联的热点ID
- `isRead` - 是否已读
- `createdAt` - 创建时间

### CheckHistory（检查历史）
- `id` - 唯一标识
- `status` - 状态（success/failure）
- `message` - 消息
- `keywordsChecked` - 检查的关键词数
- `hotspotsFound` - 发现的热点数
- `createdAt` - 创建时间

## API 端点

### 关键词 API
- `GET /api/keywords` - 获取所有关键词
- `POST /api/keywords` - 创建新关键词
- `PUT /api/keywords/:id` - 更新关键词
- `DELETE /api/keywords/:id` - 删除关键词

### 热点 API
- `GET /api/hotspots` - 获取热点列表（支持分页和筛选）
- `GET /api/hotspots/:id` - 获取单个热点详情
- `GET /api/hotspots/dashboard/latest` - 获取最新热点

### 通知 API
- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/:id/read` - 标记通知为已读
- `PUT /api/notifications/read-all` - 标记所有通知为已读
- `GET /api/notifications/count/unread` - 获取未读通知数量

### 搜索 API
- `GET /api/search?q=keyword` - 搜索热点

### 检查 API
- `POST /api/check` - 触发热点检查
- `GET /api/check/history` - 获取检查历史

## 运行方式

### 1. 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置环境变量
复制 `.env.example` 文件并重命名为 `.env`：
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置你的 API 密钥：
```env
DATABASE_URL="file:./dev.db"
PORT=3001

# OpenRouter API (必需)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Twitter API (可选)
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_SECRET=your_twitter_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. 初始化数据库
```bash
cd backend

# 生成 Prisma Client
npx prisma generate

# 创建数据库并执行迁移
npx prisma migrate dev --name init
```

### 4. 启动服务
在一个终端窗口启动后端：
```bash
cd backend
npm run dev
```

在另一个终端窗口启动前端：
```bash
cd frontend
npm run dev
```

### 5. 访问应用
打开浏览器访问 `http://localhost:5173`

## 开发

### 后端开发
```bash
cd backend
npm run dev  # 使用 nodemon 自动重启
```

### 前端开发
```bash
cd frontend
npm run dev  # Vite 开发服务器
```

### 数据库管理
```bash
cd backend

# 打开 Prisma Studio（可视化的数据库管理界面）
npx prisma studio

# 创建新的迁移
npx prisma migrate dev --name migration_name

# 重置数据库（慎用）
npx prisma migrate reset
```

## 注意事项

1. **API 密钥配置**：OpenRouter API 密钥是必需的，Twitter API 是可选的
2. **数据库**：使用 SQLite，数据存储在 `backend/dev.db` 文件中
3. **API 限流**：Twitter API 有严格的速率限制，请注意使用频率
4. **热点去重**：相同的标题在24小时内不会被重复记录

## 许可证
MIT

## 优化建议（待实施）
- [ ] 性能优化：添加缓存机制
- [ ] 代码重构：模块化服务层
- [ ] 错误处理：完善异常处理
- [ ] 安全性：添加输入验证
- [ ] 监控：添加日志和监控
- [ ] 测试：添加单元测试和集成测试
- [ ] 部署：优化生产环境配置

## 联系方式
如有问题，请通过以下方式联系：
- 项目维护者：[您的信息]
- 仓库地址：[项目仓库链接]
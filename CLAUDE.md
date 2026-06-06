# Wordog — 词汇学习 × 电子宠物

一只会陪着你背单词的柴犬。V1 全栈 Web App。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19 + TypeScript 5 + Tailwind v4 + Framer Motion 12 |
| 数据库 | PostgreSQL 16 (本地) + Prisma 7 (`@prisma/adapter-pg`，非直连) |
| 认证 | NextAuth 5 beta (Credentials Provider + bcrypt) |
| 验证 | Zod 4 |
| AI | DeepSeek API（词典查词） |
| 发音 | Free Dictionary API（真人 mp3） |
| 天气 | Open-Meteo API（免费，无需 key） |

**重要：Prisma 7 要求** — 初始化客户端必须显式传入 `PrismaPg` adapter，不是 `new PrismaClient()`。见 [src/lib/prisma.ts](src/lib/prisma.ts)。

## 目录结构

```
src/
├── app/
│   ├── (main)/           # 主界面（4个标签页 + 子页面）
│   │   ├── layout.tsx    # 橙色渐变背景 + BottomNav
│   │   ├── home/         # 首页：小狗展示
│   │   ├── learn/        # 学习中心 + 新词学习 + 复习 + 拼写
│   │   ├── stats/        # 统计仪表盘 + 打卡日历
│   │   ├── lookup/       # DeepSeek 词典查词
│   │   ├── me/           # 个人页 + 退出
│   │   └── wordbooks/    # 自建词库管理
│   ├── auth/             # 登录/注册
│   └── api/              # 19 个 API 路由（见下方）
├── components/
│   ├── dog/              # DogDisplay, DogStatusBars
│   ├── learn/            # MeaningChoice, KnowJudge
│   ├── shop/             # ShopDrawer
│   ├── ui/               # BottomNav, WordCard, PronounceButton
│   └── weather/          # WeatherWidget
├── lib/
│   ├── auth.ts           # NextAuth v5 配置
│   ├── prisma.ts         # Prisma 客户端单例
│   ├── ebbinghaus.ts     # 艾宾浩斯复习间隔
│   ├── dog.ts            # 小狗机制（饱腹/心情/连续天数）
│   ├── validations.ts    # Zod schemas
│   └── text.ts           # 文本处理（POS 解析等）
└── generated/prisma/     # Prisma 生成代码（gitignored）
prisma/
├── schema.prisma         # 18 个模型
├── seed.ts               # 种子数据
└── migrations/
scripts/                  # import-words.ts 等工具
```

## 学习系统（核心业务逻辑）

### 三轮间隔重复状态机

单词不是连续学三次 — 每轮通过后**插入队列后方间隔出现**，实现类 Anki/百词斩的间隔效应：

```
Round 1 (选词意，4个选项)
  → 答对: 5个词后以 Round 2 重新出现
  → 答错: 5个词后以 Round 1 重新出现（回退）

Round 2 (认识/不认识判断)
  → 认识: 8个词后以 Round 3 重新出现
  → 不认识: 5个词后回退到 Round 1

Round 3 (认识/不认识判断)
  → 认识: 完成！进入艾宾浩斯复习队列
  → 不认识: 5个词后回退到 Round 1
```

实现位置：[src/app/(main)/learn/new/page.tsx](src/app/(main)/learn/new/page.tsx)

### 艾宾浩斯复习

间隔：[0, 1, 2, 4, 7, 15, 30] 天。Review 页选出到期词，认识→下一阶段，不认识→回到学习队列 Round 1。

实现位置：[src/lib/ebbinghaus.ts](src/lib/ebbinghaus.ts)

### 每轮完成奖励：狗粮 +10

## 小狗系统

- 🦴 **狗粮货币**：学习赚取，用于喂食/买装扮/解锁品种
- 🍖 **饱腹度** (0-100)：每天消耗 12 点，喂食 +20
- ❤️ **心情** (0-100)：受连续学习天数和饱腹度影响，决定动画状态
- 无等级、无体型变化

实现位置：[src/lib/dog.ts](src/lib/dog.ts)

## API 路由一览

| 端点 | 方法 | 功能 |
|---|---|---|
| `/api/auth/[...nextauth]` | * | NextAuth 处理器 |
| `/api/auth/register` | POST | 注册（创建 User + Dog） |
| `/api/dog` | GET | 获取小狗状态 |
| `/api/dog` | PUT | 喂食/买装扮/解锁品种/装备 |
| `/api/learn` | POST | 开始学习会话（10词 + 每日打卡） |
| `/api/learn` | PUT | 提交学习答案 |
| `/api/review` | GET | 获取待复习词 |
| `/api/review` | PUT | 提交复习判断 |
| `/api/spelling` | GET/PUT | 拼写练习 |
| `/api/checkin` | POST | 每日打卡 |
| `/api/lookup` | GET | DeepSeek 查词 |
| `/api/lookup/suggest` | GET | 模糊搜索建议 |
| `/api/stats` | GET | 统计仪表盘数据 |
| `/api/shop` | GET | 商店数据 |
| `/api/wordbooks` | GET | 词库进度 |
| `/api/words/custom/**` | CRUD | 自建词库管理 |
| `/api/words/add-to-book` | POST | 单词加入自定义词库 |

## 设计规范

- **配色**：暖橙色系（orange/amber），渐变背景，毛玻璃卡片，圆角 `rounded-2xl`
- **字体**：Fredoka (标题) + Nunito (正文)，Google Fonts
- **动效**：Framer Motion spring 动画，底部弹出式卡片，悬浮胶囊导航
- **移动优先**：viewport 390×844 为基准

## 数据库关键约束

- `UserWord`: `@@unique([userId, wordId])` — 用 `upsert` 操作，不要用 `createMany`
- `Dog`: `@@unique([userId])` — 一个用户只有一只狗
- `CheckIn`: `@@unique([userId, date])` — 每天只能打卡一次
- `Word`: `@@unique([word, wordBookId])` — 同一词库内词不重复

## 测试账号

邮箱 `test@wordog.com` 密码 `test1234`

## 环境变量

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wordog
AUTH_SECRET=dev-secret-change-in-production
AUTH_URL=http://localhost:3000
DEEPSEEK_API_KEY=sk-your-key
```

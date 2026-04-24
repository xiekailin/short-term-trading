# short-term-trading

一个面向中文用户的美股期权观察站原型，采用深色金属金风格，重点展示股票报价、波动率和期权链。

## 当前部署形态

这个仓库当前面向 **GitHub Pages** 部署，属于 **纯静态站**：

- 首页和详情页可以在线打开
- 展示的是最近一次生成的市场快照
- GitHub Actions 会尝试约每 10 分钟重新生成并部署一次快照
- **不是实时行情**，已打开的页面需要手动刷新才能看到最新部署
- 不运行 Next.js 服务端 API Routes

当前保留页面：

- `/` 观察列表
- `/symbol/mstr`
- `/symbol/crcl`
- `/symbol/qqq`

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## 本地开发

```bash
npm install
npm run dev
```

打开：

```bash
http://localhost:3000
```

## 本地构建静态站

```bash
npm run build
```

构建完成后会生成静态导出目录：

```bash
out/
```

可以用任意静态文件服务器预览 `out/`。

## GitHub Pages 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages。

首次使用前请在 GitHub 仓库里确认：

1. 仓库已推送到 GitHub
2. Settings → Pages → Source 使用 GitHub Actions
3. Actions 权限允许工作流部署 Pages

工作流文件：

```bash
.github/workflows/deploy-pages.yml
```

推送到 `main`、手动触发 workflow，或 GitHub Actions 定时任务运行时会自动：

- 安装依赖
- 抓取 Yahoo 数据并生成 `src/lib/static-snapshot.ts`
- 执行 `next build`
- 上传 `out/`
- 发布到 GitHub Pages

工作流会在 GitHub Actions 环境里自动读取当前仓库名，并生成对应的 Pages 子路径资源前缀。

## 数据说明

当前站点使用构建时生成的静态快照数据：

- 数据文件位于 `src/lib/static-snapshot.ts`
- 生成脚本位于 `scripts/update-static-snapshot.mjs`
- 覆盖标的：`MSTR`、`CRCL`、`QQQ`
- 首页、详情页都直接读取快照数据
- GitHub Actions 定时任务使用 `*/10 * * * *`，会尝试约每 10 分钟刷新一次
- GitHub Actions 和 Pages 部署都有延迟，不保证精确 10 分钟
- 已打开的浏览器页面不会自动变新，需要手动刷新页面

本地手动刷新快照：

```bash
npm run refresh:snapshot
```

## 注意事项

- GitHub Pages **不能运行**当前项目原本那套 Next.js 服务端 API
- 因此现在页面上的行情、期权链、HV20、Expected Move 都基于快照，不是请求时动态拉取
- 如果以后要恢复实时数据，建议切回支持 Next.js 服务端的平台，例如 Vercel

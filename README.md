<<<<<<< HEAD
# 🎂 生日祝福礼物网站

一个前后端分离的星空浪漫主题生日祝福网站：每次打开会记录访问次数，展示"认识的天数"（自 2023-06-10 起），带仪式感的生日动画、打字机祝福文案、循环背景音乐，并可生成二维码供对方扫码进入。

## 目录结构

```
gift/
├── frontend/             # 前端（静态 HTML/CSS/JS）
│   ├── index.html
│   ├── css/style.css
│   ├── js/content.js     # ★ 文案与配置（改这里即可）
│   ├── js/main.js        # 星空/动画/打字机/音乐逻辑
│   └── assets/audio/     # ★ 音乐放这里（music.mp3）
├── api/stats.js          # 后端 API（Vercel Serverless + KV）
├── server/dev.js         # 本地开发服务器（node:sqlite）
├── scripts/qrcode.js     # 生成二维码
├── vercel.json           # Vercel 配置
└── package.json
```

## 一、本地预览（不用注册任何账号）

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:8080`，点击「打开礼物」即可看到完整动画。刷新页面，访问次数会 +1（数据存在本地 `data/gift.db`，用内置 SQLite，零依赖）。

## 二、替换文案和音乐

1. **文案**：编辑 [frontend/js/content.js](frontend/js/content.js) 里的 `SITE_CONFIG.lines` 数组，把占位内容换成你写好的祝福；顺便可改 `herName`（称呼）、`title`、`startDate`（认识的日子）。
2. **音乐**：把完整歌曲命名为 `music.mp3`，放到 [frontend/assets/audio/](frontend/assets/audio/) 目录。若格式不是 mp3，同步改 `content.js` 里的 `musicFile`。

## 三、部署到 Vercel（生成正式网址）

### 1. 推送到 GitHub

本地仓库已初始化并提交（分支 `main`）。在 GitHub 上新建一个**空仓库**（**不要**勾选 README / .gitignore，避免冲突），然后在 `gift` 目录执行：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. Vercel 部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录 → **Add New → Project** → 选择该仓库，Vercel 会自动识别（无需改构建命令）。
2. 进入项目 **Storage** → 创建一个 **KV Database**，按提示关联到本项目（Vercel 会自动注入环境变量，后端 `api/stats.js` 即用 `@vercel/kv` 读写访问次数）。
3. 点 **Deploy**，完成后得到一个网址，形如 `https://你的项目.vercel.app`。

> 建议：建好 KV 数据库后重新部署一次，确保访问计数功能生效（未建 KV 时前端会优雅降级）。

> 注意：`api/` 目录会被 Vercel 自动识别为 Serverless Function；`vercel.json` 里 `outputDirectory: "frontend"` 指定静态前端目录。KV 未创建时访问次数会返回 `null`，前端会优雅降级。

## 四、生成二维码（她扫码进入）

拿到正式网址后：

```bash
npm run qr -- https://你的项目.vercel.app
```

会在项目根目录生成 `qrcode.png`，发给她扫码即可（可自行美化、加边框后再发）。

## API

`GET /api/stats` → `{ "visits": 累计次数, "since": "2023-06-10" }`

每次调用访问次数 +1（原子自增）；前端用 `since` 在本地计算"认识的天数"。
=======
# zhanna_birthday_gift
about friend birthday's web
>>>>>>> b35f609086786109be7625309196dac53b4fe685

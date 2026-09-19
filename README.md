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
├── server/dev.js         # Node 服务端（静态文件 + 访问计数 API，内置 SQLite 持久化）
├── scripts/qrcode.js     # 生成二维码
├── render.yaml           # Render 部署配置（Blueprint）
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

## 三、部署到 Render（生成正式网址）

### 1. 推送到 GitHub

本地仓库已初始化并提交（分支 `main`）。在 GitHub 上新建一个**空仓库**（**不要**勾选 README / .gitignore，避免冲突），然后在 `gift` 目录执行：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. Render 部署（Blueprint 一键部署）

1. 打开 [render.com](https://render.com)，用 GitHub 登录 → **New → Blueprint** → 选择该仓库，Render 会自动读取根目录的 [render.yaml](render.yaml) 并创建一个 Web Service。
2. 点 **Apply**，等待部署完成，得到一个网址，形如 `https://你的项目.onrender.com`。
3. 打开网址 → 点击「打开礼物」即可看到完整动画；刷新一次，访问次数 +1。

> ⚠️ **免费套餐注意**：Render 免费 Web Service 无持久磁盘，空闲约 15 分钟会休眠，且重新部署/重启时 `data/gift.db` 会被重置，**访问次数会清零**。若想永久保留访问次数：
> 1. 在 Render 项目里把实例升级到 **Starter**；
> 2. 取消 [render.yaml](render.yaml) 里 `disk:` 段的注释（挂载持久磁盘到 `data` 目录），重新部署。
>
> 「认识的天数」不受影响：它由前端 `content.js` 的 `startDate` 在本地计算，不依赖后端数据库。

## 四、生成二维码（她扫码进入）

拿到正式网址后：

```bash
npm run qr -- https://你的项目.onrender.com
```

会在项目根目录生成 `qrcode.png`，发给她扫码即可（可自行美化、加边框后再发）。

## API

`GET /api/stats` → `{ "visits": 累计次数, "since": "2023-06-10" }`

每次调用访问次数 +1（原子自增）；前端用 `since` 在本地计算"认识的天数"。

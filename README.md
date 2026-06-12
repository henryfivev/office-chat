# OfficeChat

无需自建服务器的网页版文档伪装聊天室。技术栈为 Next.js App Router、React、TypeScript、Tailwind CSS、Zustand 和 Supabase。

## 功能

- 创建房间并生成邀请码
- 通过 `/room/{inviteCode}` 加入房间
- Supabase 匿名登录
- Postgres Changes 实时消息
- Presence 在线人数
- 图片消息上传到 Supabase Storage
- 飞书文档、钉钉文档、腾讯文档三种主题
- Esc 或 `Ctrl + \`` 老板键伪装文档页面

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env.local
```

填写：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. 在 Supabase SQL Editor 中依次执行：

```text
supabase/schema.sql
supabase/policies.sql
```

4. 在 Supabase Dashboard 中确认：

- Authentication 开启 Anonymous sign-ins
- Realtime 已对 `messages` 表生效
- Storage bucket `chat-images` 存在且 public

5. 启动开发服务器：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run dev
npm run build
npm run typecheck
```

## 目录

```text
app/                 Next.js App Router 页面
components/chat/     聊天、消息列表、输入区、在线人数
components/themes/   主题外壳和老板键伪装页面
lib/                 Supabase、主题与工具函数
store/               Zustand 状态
types/               共享类型
supabase/            建表与 RLS 策略
```

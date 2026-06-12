# OfficeChat

无需自建服务器、伪装成办公协作工具的实时沟通平台。用户第一眼看到的是文档、知识库或协同编辑记录，沟通能力通过评论、编辑记录和讨论区承载。

## 功能

- 创建文档空间并生成邀请码
- 通过 `/room/{inviteCode}` 打开文档空间
- Supabase 匿名登录
- Postgres Changes 实时评论
- Presence 当前协作者数量
- 图片以附件形式插入，默认显示文件链接
- Document Shell 文档模板：项目方案、技术设计、OKR、周报/纪要、需求文档、知识库、产品规划
- FeishuRenderer、DingtalkRenderer、TencentDocRenderer 三套不同布局和评论渲染
- Esc 或 `Ctrl + \`` 老板键切换纯文档模式，隐藏评论区和输入区

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
- Realtime 已对 `comments` 表生效
- Storage bucket `doc-attachments` 存在且 public

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
app/                   Next.js App Router 页面
components/comments/   评论输入与附件展示
components/document/   Document Shell、目录、正文、文档空间
components/themes/     三套 ThemeRenderer
lib/                   Supabase、文档模板、主题与工具函数
store/                 Zustand 状态
types/                 共享类型
supabase/              建表与 RLS 策略
```

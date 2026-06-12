# OfficeChat MVP 技术方案

## 1. 项目目标

做一个无需自建服务器的网页版聊天室。

核心能力：

* 创建聊天室房间
* 通过邀请链接加入房间
* 实时发送/接收消息
* 显示在线人数
* 支持飞书文档、钉钉文档、腾讯文档三种主题
* 支持老板键
* 支持图片消息

---

## 2. 技术栈

### 前端

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Zustand
* Supabase JS SDK

### 后端服务

不自建后端。

使用 Supabase：

* Supabase Auth：匿名登录
* Supabase Postgres：存储房间、成员、消息
* Supabase Realtime：实时消息和在线状态
* Supabase Storage：图片存储

部署使用：

* Vercel

Supabase Realtime 支持 Broadcast、Presence 和 Postgres Changes，可用于实时消息和在线状态。Vercel 适合直接部署 Next.js 项目。Supabase 也支持匿名登录。

# 3. 项目目录结构

```text
office-chat/
  app/
    page.tsx
    room/
      [inviteCode]/
        page.tsx
    create/
      page.tsx
    globals.css

  components/
    chat/
      ChatRoom.tsx
      MessageList.tsx
      MessageInput.tsx
      OnlineUsers.tsx
    themes/
      ThemeShell.tsx
      FeishuTheme.tsx
      DingtalkTheme.tsx
      TencentDocTheme.tsx
      BossMode.tsx
    ui/

  lib/
    supabase.ts
    theme.ts
    utils.ts

  store/
    userStore.ts
    roomStore.ts

  types/
    index.ts

  supabase/
    schema.sql
    policies.sql
```

---

# 4. 数据库设计

## rooms

```sql
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  theme text not null default 'feishu',
  created_by uuid,
  created_at timestamptz not null default now()
);
```

## room_members

```sql
create table room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null,
  nickname text not null,
  avatar_url text,
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);
```

## messages

```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null,
  nickname text not null,
  type text not null default 'text',
  content text,
  file_url text,
  status text not null default 'normal',
  created_at timestamptz not null default now()
);

create index idx_messages_room_created_at
on messages(room_id, created_at desc);
```

---

# 5. RLS 策略

MVP 可以简化：

* 开启 RLS
* 登录用户可以创建房间
* 登录用户可以读取房间
* 登录用户可以加入房间
* 房间成员可以读写该房间消息

```sql
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table messages enable row level security;
```

建议先实现基础可用策略，后续再收紧。

---

# 6. 核心页面

## 首页 `/`

功能：

* 展示产品名称
* 输入昵称
* 创建房间按钮
* 输入邀请链接/邀请码加入房间

---

## 创建房间页 `/create`

功能：

* 输入房间名称
* 选择默认主题
* 创建房间
* 创建成功后跳转 `/room/{inviteCode}`

---

## 房间页 `/room/[inviteCode]`

功能：

* 匿名登录
* 如果没有昵称，要求填写昵称
* 根据 inviteCode 查询房间
* 加入 room_members
* 加载最近 100 条消息
* 订阅实时消息
* 订阅在线状态
* 发送消息
* 切换主题
* 老板键

---

# 7. 实时消息方案

## 推荐实现

发送消息时：

1. 前端插入 `messages` 表
2. Supabase Realtime 监听 `messages` 表 insert
3. 当前房间客户端收到新消息
4. 更新消息列表

订阅条件：

```ts
supabase
  .channel(`room:${roomId}:messages`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    },
    payload => {
      // append message
    }
  )
  .subscribe()
```

---

# 8. 在线状态方案

使用 Supabase Presence。

```ts
const channel = supabase.channel(`room:${roomId}:presence`, {
  config: {
    presence: {
      key: userId
    }
  }
})

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  // 计算在线人数
})

channel.subscribe(async status => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: userId,
      nickname,
      online_at: new Date().toISOString()
    })
  }
})
```

---

# 9. 图片消息方案

流程：

1. 用户选择图片
2. 上传到 Supabase Storage bucket：`chat-images`
3. 获取 public URL
4. 插入一条 `type = image` 的 message

限制：

* 只允许 jpg/png/webp/gif
* 单张图片最大 5MB

---

# 10. 主题系统

主题类型：

```ts
export type ThemeType = 'feishu' | 'dingtalk' | 'tencent_doc'
```

主题配置：

```ts
export const themes = {
  feishu: {
    name: '飞书文档',
    fakeTitle: '项目方案讨论',
    layout: 'doc-comment'
  },
  dingtalk: {
    name: '钉钉文档',
    fakeTitle: '团队知识库',
    layout: 'knowledge-base'
  },
  tencent_doc: {
    name: '腾讯文档',
    fakeTitle: '协同编辑文档',
    layout: 'spreadsheet-doc'
  }
}
```

要求：

* 同一套聊天数据
* 不同主题只改变 UI 外观
* 消息区域不要像微信气泡
* 消息尽量展示成“评论”“编辑记录”“文档讨论”

---

# 11. 老板键

快捷键：

```text
Esc
Ctrl + `
```

效果：

* 隐藏真实消息列表
* 显示伪装文档内容
* 保持 WebSocket / Realtime 连接不断开
* 再按一次恢复

伪装页面内容：

* OKR 文档
* 项目进度表
* 需求评审记录
* 技术方案草稿

---

# 12. 状态管理

使用 Zustand。

## userStore

```ts
interface UserState {
  userId: string | null
  nickname: string | null
  setUser: (userId: string, nickname: string) => void
}
```

## roomStore

```ts
interface RoomState {
  roomId: string | null
  theme: ThemeType
  bossMode: boolean
  setTheme: (theme: ThemeType) => void
  toggleBossMode: () => void
}
```

---

# 13. 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 14. Codex 生成要求

请生成一个完整可运行的 Next.js 项目。

要求：

1. 使用 TypeScript
2. 使用 App Router
3. 使用 Tailwind CSS
4. 使用 Supabase JS SDK
5. 不要生成自建 Node/Go 后端
6. 所有数据读写都走 Supabase
7. 提供 `supabase/schema.sql`
8. 提供 `supabase/policies.sql`
9. 页面需要可直接运行
10. UI 需要有三种主题：

* 飞书文档主题
* 钉钉文档主题
* 腾讯文档主题

11. 聊天消息不要做成微信气泡
12. 房间通过 inviteCode 访问
13. 支持匿名登录
14. 支持在线人数
15. 支持老板键
16. 支持图片上传
17. README 中写清楚本地启动步骤

---

# 15. MVP 验收标准

## 创建房间

* 可以输入房间名
* 可以选择主题
* 创建后生成邀请链接
* 跳转房间页

## 加入房间

* 访问邀请链接
* 输入昵称
* 成功加入房间

## 聊天

* 可以发送文本
* 多个浏览器窗口可以实时收到消息
* 刷新后能看到历史消息

## 在线状态

* 多开窗口时在线人数正确变化

## 主题

* 可以切换三种主题
* 切换后消息仍然存在
* 页面视觉明显不同

## 老板键

* 按 Esc 可以进入伪装页面
* 再按 Esc 可以恢复聊天

## 图片

* 可以上传图片
* 图片消息可以展示

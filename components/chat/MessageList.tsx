import type { ChatMessage, ThemeType } from '@/types';
import { formatTime } from '@/lib/utils';

function actionLabel(type: ChatMessage['type']) {
  return type === 'image' ? '上传了图片资料' : '添加了一条讨论';
}

export function MessageList({
  messages,
  currentUserId,
  theme
}: {
  messages: ChatMessage[];
  currentUserId: string | null;
  theme: ThemeType;
}) {
  if (messages.length === 0) {
    return (
      <div className="grid h-full place-items-center px-6 py-16 text-center text-sm text-slate-500">
        暂无讨论记录，发送第一条消息开始协作。
      </div>
    );
  }

  return (
    <div className="grid gap-0">
      {messages.map((message, index) => {
        const mine = message.user_id === currentUserId;
        const marker =
          theme === 'tencent_doc' ? '单元格备注' : theme === 'dingtalk' ? '知识库评论' : '文档批注';

        return (
          <article
            key={message.id}
            className="grid grid-cols-[120px_1fr] gap-4 border-b border-slate-100 px-5 py-4 text-sm max-sm:grid-cols-1"
          >
            <aside className="text-slate-500">
              <p className="font-medium text-slate-700">{formatTime(message.created_at)}</p>
              <p className="mt-1">{marker} #{index + 1}</p>
            </aside>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{message.nickname}</span>
                <span className="text-slate-400">{actionLabel(message.type)}</span>
                {mine ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">我</span> : null}
              </div>
              {message.type === 'image' && message.file_url ? (
                <a href={message.file_url} target="_blank" rel="noreferrer" className="inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.file_url}
                    alt={message.content || '图片消息'}
                    className="max-h-80 rounded-md border border-slate-200 object-contain"
                  />
                </a>
              ) : (
                <p className="whitespace-pre-wrap break-words leading-7 text-slate-700">{message.content}</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

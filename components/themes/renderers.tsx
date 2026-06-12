import type { MutableRefObject, ReactNode } from 'react';
import { BookOpen, Clock3, FileText, Grid3X3, Library, MessageSquareText, Users } from 'lucide-react';
import { CommentAttachment } from '@/components/comments/CommentAttachment';
import { DocumentContent } from '@/components/document/DocumentContent';
import { DocumentSidebar } from '@/components/document/DocumentSidebar';
import { formatTime } from '@/lib/utils';
import type { Comment, DocumentShell, ThemeType } from '@/types';

interface ThemeRendererProps {
  document: DocumentShell;
  comments: Comment[];
  currentUserId: string | null;
  collaboratorCount: number;
  bossMode: boolean;
  toolbar: ReactNode;
  controls: ReactNode;
  input: ReactNode;
  bottomRef: MutableRefObject<HTMLDivElement | null>;
}

export interface ThemeRenderer {
  renderHeader(props: ThemeRendererProps): ReactNode;
  renderSidebar(props: ThemeRendererProps): ReactNode;
  renderContent(props: ThemeRendererProps): ReactNode;
  renderComment(props: ThemeRendererProps): ReactNode;
  renderInput(props: ThemeRendererProps): ReactNode;
  render(props: ThemeRendererProps): ReactNode;
}

function EmptyComments({ label }: { label: string }) {
  return <div className="px-4 py-10 text-center text-sm text-slate-500">{label}</div>;
}

function sectionName(document: DocumentShell, index: number) {
  return document.sections[index % document.sections.length]?.title.replace(/^\d+\.\s*/, '') || '正文';
}

function FeishuComments({ props }: { props: ThemeRendererProps }) {
  if (props.comments.length === 0) {
    return <EmptyComments label="暂无评论，选择正文内容后发表评论。" />;
  }

  return (
    <div className="grid gap-3 p-3">
      {props.comments.map((comment, index) => (
        <article key={comment.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <span className="font-semibold text-slate-900">{comment.nickname}</span>
            <span className="text-slate-500">评论了「{sectionName(props.document, index)}」</span>
            {comment.user_id === props.currentUserId ? (
              <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">我</span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-400">{formatTime(comment.created_at)}</p>
          <div className="mt-3 leading-6 text-slate-700">
            {comment.type === 'image' && comment.file_url ? (
              <CommentAttachment fileName={comment.content || '附件.png'} fileUrl={comment.file_url} />
            ) : (
              <p className="whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </div>
        </article>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
}

function TencentHistory({ props }: { props: ThemeRendererProps }) {
  if (props.comments.length === 0) {
    return <EmptyComments label="暂无编辑记录。" />;
  }

  return (
    <div className="divide-y divide-emerald-100">
      {props.comments.map((comment) => (
        <article key={comment.id} className="grid grid-cols-[70px_1fr] gap-3 px-4 py-3 text-sm">
          <time className="font-medium text-emerald-700">{formatTime(comment.created_at)}</time>
          <div>
            <p className="font-semibold text-slate-900">{comment.nickname} 更新内容</p>
            <div className="mt-2 text-slate-700">
              {comment.type === 'image' && comment.file_url ? (
                <CommentAttachment fileName={comment.content || '附件.png'} fileUrl={comment.file_url} />
              ) : (
                <p className="whitespace-pre-wrap break-words">{comment.content}</p>
              )}
            </div>
          </div>
        </article>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
}

function DingtalkDiscussion({ props }: { props: ThemeRendererProps }) {
  if (props.comments.length === 0) {
    return <EmptyComments label="暂无讨论内容。" />;
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
        讨论主题：{sectionName(props.document, props.comments.length - 1)}
      </div>
      {props.comments.map((comment) => (
        <article key={comment.id} className="border-b border-slate-100 pb-3 last:border-0">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-900">{comment.nickname}</p>
            <time className="text-xs text-slate-400">{formatTime(comment.created_at)}</time>
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-700">
            {comment.type === 'image' && comment.file_url ? (
              <CommentAttachment fileName={comment.content || '附件.png'} fileUrl={comment.file_url} />
            ) : (
              <p className="whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </div>
        </article>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
}

const feishuRenderer: ThemeRenderer = {
  renderHeader: (props) => (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-sky-600 text-white">
          <FileText size={17} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950">{props.document.title}</p>
          <p className="text-xs text-slate-500">当前协作者：{props.collaboratorCount}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">{props.toolbar}</div>
    </header>
  ),
  renderSidebar: (props) => <DocumentSidebar document={props.document} className="hidden w-56 lg:block" />,
  renderContent: (props) => (
    <main className="overflow-y-auto bg-slate-50">
      <DocumentContent document={props.document} />
    </main>
  ),
  renderComment: (props) =>
    props.bossMode ? null : (
      <aside className="grid min-h-0 grid-rows-[auto_1fr] border-l border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquareText size={16} />
            评论
          </span>
          {props.controls}
        </div>
        <div className="overflow-y-auto">
          <FeishuComments props={props} />
        </div>
      </aside>
    ),
  renderInput: (props) => (props.bossMode ? null : props.input),
  render: (props) => (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] bg-slate-100">
      {feishuRenderer.renderHeader(props)}
      <div
        className={
          props.bossMode
            ? 'grid min-h-0 grid-cols-[auto_minmax(0,1fr)] max-lg:grid-cols-[minmax(0,1fr)]'
            : 'grid min-h-0 grid-cols-[auto_minmax(0,1fr)_360px] max-lg:grid-cols-[minmax(0,1fr)]'
        }
      >
        {feishuRenderer.renderSidebar(props)}
        {feishuRenderer.renderContent(props)}
        {feishuRenderer.renderComment(props)}
      </div>
      {feishuRenderer.renderInput(props)}
    </div>
  )
};

const tencentRenderer: ThemeRenderer = {
  renderHeader: (props) => (
    <header className="border-b border-emerald-100 bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-600 text-white">
            <Grid3X3 size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">{props.document.title}</p>
            <p className="text-xs text-slate-500">正在编辑文档 · 当前协作者：{props.collaboratorCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">{props.toolbar}</div>
      </div>
      <div className="flex h-10 items-center gap-3 border-t border-emerald-50 px-4 text-xs text-slate-500">
        <span>文件</span>
        <span>编辑</span>
        <span>插入</span>
        <span>数据</span>
        <span>协作</span>
      </div>
    </header>
  ),
  renderSidebar: (props) => (
    <aside className="hidden border-r border-emerald-100 bg-[#f8fbf8] p-4 lg:block">
      <p className="mb-3 text-xs font-semibold text-emerald-700">编辑区域</p>
      {props.document.sections.map((section, index) => (
        <div key={section.id} className="grid grid-cols-[36px_1fr] border-b border-emerald-100 text-sm">
          <span className="bg-emerald-50 px-2 py-2 text-emerald-700">A{index + 1}</span>
          <a href={`#${section.id}`} className="px-2 py-2 text-slate-600 hover:text-emerald-700">
            {section.title}
          </a>
        </div>
      ))}
    </aside>
  ),
  renderContent: (props) => (
    <main className="overflow-y-auto bg-[#f8fbf8] p-4">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-md border border-emerald-100 bg-white">
        <DocumentContent document={props.document} dense />
      </div>
    </main>
  ),
  renderComment: (props) =>
    props.bossMode ? null : (
      <aside className="grid min-h-0 grid-rows-[auto_1fr] border-l border-emerald-100 bg-white">
        <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock3 size={16} />
            编辑记录
          </span>
          {props.controls}
        </div>
        <div className="overflow-y-auto">
          <TencentHistory props={props} />
        </div>
      </aside>
    ),
  renderInput: (props) => (props.bossMode ? null : props.input),
  render: (props) => (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] bg-[#f8fbf8]">
      {tencentRenderer.renderHeader(props)}
      <div
        className={
          props.bossMode
            ? 'grid min-h-0 grid-cols-[220px_minmax(0,1fr)] max-lg:grid-cols-[minmax(0,1fr)]'
            : 'grid min-h-0 grid-cols-[220px_minmax(0,1fr)_360px] max-lg:grid-cols-[minmax(0,1fr)]'
        }
      >
        {tencentRenderer.renderSidebar(props)}
        {tencentRenderer.renderContent(props)}
        {tencentRenderer.renderComment(props)}
      </div>
      {tencentRenderer.renderInput(props)}
    </div>
  )
};

const dingtalkRenderer: ThemeRenderer = {
  renderHeader: (props) => (
    <header className="flex h-14 items-center justify-between border-b border-blue-100 bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white">
          <Library size={17} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950">{props.document.title}</p>
          <p className="text-xs text-slate-500">知识库 · 当前协作者：{props.collaboratorCount}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">{props.toolbar}</div>
    </header>
  ),
  renderSidebar: (props) => (
    <aside className="hidden border-r border-blue-100 bg-[#f7f9fc] p-4 lg:block">
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        <BookOpen size={16} />
        知识库目录
      </div>
      <DocumentSidebar document={props.document} title="条目" className="border-0 bg-transparent p-0" />
    </aside>
  ),
  renderContent: (props) => (
    <main className="overflow-y-auto bg-[#f7f9fc]">
      <DocumentContent document={props.document} />
    </main>
  ),
  renderComment: (props) =>
    props.bossMode ? null : (
      <section className="grid min-h-0 grid-rows-[auto_1fr] border-t border-blue-100 bg-white">
        <div className="flex items-center justify-between border-b border-blue-100 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users size={16} />
            讨论区
          </span>
          {props.controls}
        </div>
        <div className="overflow-y-auto">
          <DingtalkDiscussion props={props} />
        </div>
      </section>
    ),
  renderInput: (props) => (props.bossMode ? null : props.input),
  render: (props) => (
    <div
      className={
        props.bossMode
          ? 'grid h-screen grid-rows-[auto_minmax(0,1fr)] bg-[#f7f9fc]'
          : 'grid h-screen grid-rows-[auto_minmax(0,1fr)_240px_auto] bg-[#f7f9fc]'
      }
    >
      {dingtalkRenderer.renderHeader(props)}
      <div className="grid min-h-0 grid-cols-[260px_minmax(0,1fr)] max-lg:grid-cols-[minmax(0,1fr)]">
        {dingtalkRenderer.renderSidebar(props)}
        {dingtalkRenderer.renderContent(props)}
      </div>
      {dingtalkRenderer.renderComment(props)}
      {dingtalkRenderer.renderInput(props)}
    </div>
  )
};

export const themeRenderers: Record<ThemeType, ThemeRenderer> = {
  feishu: feishuRenderer,
  tencent_doc: tencentRenderer,
  dingtalk: dingtalkRenderer
};

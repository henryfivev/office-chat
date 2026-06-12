'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { FilePlus2, Loader2, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { isAllowedImage } from '@/lib/utils';

export function CommentInput({
  onPublishText,
  onInsertAttachment,
  disabled
}: {
  onPublishText: (content: string) => Promise<void>;
  onInsertAttachment: (file: File) => Promise<void>;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = content.trim();
    if (!text || publishing) return;

    setError('');
    setPublishing(true);
    try {
      await onPublishText(text);
      setContent('');
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : '发布评论失败');
    } finally {
      setPublishing(false);
    }
  }

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || publishing) return;

    if (!isAllowedImage(file)) {
      setError('仅支持 jpg/png/webp/gif，单个附件最大 5MB。');
      return;
    }

    setError('');
    setPublishing(true);
    try {
      await onInsertAttachment(file);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '插入附件失败');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <textarea
          className="min-h-20 w-full resize-none rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="发表评论"
          disabled={disabled || publishing}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAttachmentChange}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || publishing}
              title="插入附件"
            >
              <FilePlus2 size={16} />
              插入附件
            </Button>
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
          <Button disabled={disabled || publishing || !content.trim()}>
            {publishing ? <Loader2 className="animate-spin" size={16} /> : <SendHorizonal size={16} />}
            发布评论
          </Button>
        </div>
      </form>
    </div>
  );
}

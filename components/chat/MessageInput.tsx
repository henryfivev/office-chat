'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { ImagePlus, Loader2, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { isAllowedImage } from '@/lib/utils';

export function MessageInput({
  onSendText,
  onSendImage,
  disabled
}: {
  onSendText: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = content.trim();
    if (!text || sending) return;

    setError('');
    setSending(true);
    try {
      await onSendText(text);
      setContent('');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : '发送失败');
    } finally {
      setSending(false);
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || sending) return;

    if (!isAllowedImage(file)) {
      setError('仅支持 jpg/png/webp/gif，单张图片最大 5MB。');
      return;
    }

    setError('');
    setSending(true);
    try {
      await onSendImage(file);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '图片发送失败');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <textarea
          className="min-h-24 w-full resize-none rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="写一条文档讨论..."
          disabled={disabled || sending}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || sending}
              title="上传图片"
            >
              <ImagePlus size={16} />
              图片
            </Button>
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
          <Button disabled={disabled || sending || !content.trim()}>
            {sending ? <Loader2 className="animate-spin" size={16} /> : <SendHorizonal size={16} />}
            发送
          </Button>
        </div>
      </form>
    </div>
  );
}

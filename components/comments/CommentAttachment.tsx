import { Paperclip } from 'lucide-react';

export function CommentAttachment({
  fileName,
  fileUrl
}: {
  fileName: string;
  fileUrl: string;
}) {
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-white"
    >
      <Paperclip size={15} />
      <span className="truncate">{fileName}</span>
    </a>
  );
}

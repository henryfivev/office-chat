import type { DocumentShell } from '@/types';
import { cn } from '@/lib/utils';

export function DocumentSidebar({
  document,
  title = '目录',
  className
}: {
  document: DocumentShell;
  title?: string;
  className?: string;
}) {
  return (
    <aside className={cn('border-r border-slate-200 bg-white px-4 py-5', className)}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-normal text-slate-400">{title}</p>
      <nav className="grid gap-1">
        {document.sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            {section.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}

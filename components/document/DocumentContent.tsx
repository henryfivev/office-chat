import type { DocumentShell } from '@/types';
import { cn } from '@/lib/utils';

export function DocumentContent({
  document,
  dense = false
}: {
  document: DocumentShell;
  dense?: boolean;
}) {
  return (
    <article className={cn('mx-auto w-full max-w-3xl bg-white', dense ? 'px-6 py-5' : 'px-10 py-8 max-sm:px-5')}>
      <p className="text-sm text-slate-500">{document.subtitle}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{document.title}</h1>
      <div className="mt-8 grid gap-8">
        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
            <div className="mt-3 grid gap-2">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="leading-8 text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

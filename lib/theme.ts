import type { ThemeType } from '@/types';

export const themes: Record<
  ThemeType,
  {
    name: string;
    fakeTitle: string;
    layout: string;
    accent: string;
    surface: string;
    nav: string;
  }
> = {
  feishu: {
    name: '飞书文档',
    fakeTitle: '项目方案讨论',
    layout: 'doc-comment',
    accent: 'bg-sky-600 text-white',
    surface: 'bg-white',
    nav: 'bg-slate-50 border-slate-200'
  },
  dingtalk: {
    name: '钉钉文档',
    fakeTitle: '团队知识库',
    layout: 'knowledge-base',
    accent: 'bg-blue-600 text-white',
    surface: 'bg-[#f7f9fc]',
    nav: 'bg-white border-blue-100'
  },
  tencent_doc: {
    name: '腾讯文档',
    fakeTitle: '协同编辑文档',
    layout: 'spreadsheet-doc',
    accent: 'bg-emerald-600 text-white',
    surface: 'bg-[#f8fbf8]',
    nav: 'bg-white border-emerald-100'
  }
};

export const themeOptions = Object.entries(themes).map(([value, meta]) => ({
  value: value as ThemeType,
  label: meta.name
}));

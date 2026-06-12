import type { ThemeType } from '@/types';
import { themes } from '@/lib/theme';

const rows = [
  ['目标', '负责人', '状态', '更新时间'],
  ['Q3 协同效率优化', 'PMO', '进行中', '10:24'],
  ['知识库结构整理', '运营', '待评审', '11:10'],
  ['需求评审记录归档', '研发', '已同步', '14:35'],
  ['技术方案草稿补充', '架构', '进行中', '16:20']
];

export function BossMode({ theme }: { theme: ThemeType }) {
  const meta = themes[theme];

  return (
    <div className="grid h-full content-start gap-5 bg-white p-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-sm text-slate-500">{meta.name}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{meta.fakeTitle}</h2>
      </div>
      <section className="grid gap-3">
        <h3 className="text-base font-semibold text-slate-900">OKR 文档</h3>
        <p className="leading-7 text-slate-600">
          本阶段聚焦跨部门协同效率、需求响应速度与知识沉淀质量。各模块负责人需要在周会前更新风险、阻塞与下一步计划。
        </p>
      </section>
      <section className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.join('-')} className={rowIndex === 0 ? 'bg-slate-50 font-medium text-slate-700' : 'text-slate-600'}>
                {row.map((cell) => (
                  <td key={cell} className="border-b border-slate-100 px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="grid gap-3">
        <h3 className="text-base font-semibold text-slate-900">需求评审记录</h3>
        <ul className="grid gap-2 text-sm text-slate-600">
          <li>1. 梳理入口路径，降低新用户首次操作成本。</li>
          <li>2. 图片类资料统一归档至项目空间，保留最近版本。</li>
          <li>3. 下次评审前确认上线窗口与灰度策略。</li>
        </ul>
      </section>
    </div>
  );
}

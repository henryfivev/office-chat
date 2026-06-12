import type { DocumentShell, DocumentType } from '@/types';

export const documentTypeOptions: Array<{ value: DocumentType; label: string }> = [
  { value: 'project_plan', label: '项目方案' },
  { value: 'technical_design', label: '技术设计' },
  { value: 'okr', label: 'OKR' },
  { value: 'requirement_doc', label: '需求文档' },
  { value: 'meeting_notes', label: '会议纪要' },
  { value: 'knowledge_base', label: '知识库' },
  { value: 'product_roadmap', label: '产品规划' }
];

export const documentTemplates: Record<DocumentType, DocumentShell> = {
  technical_design: {
    type: 'technical_design',
    title: '库存扣减系统设计',
    subtitle: '技术方案草稿',
    sections: [
      {
        id: 'background',
        title: '1. 背景',
        body: ['当前库存扣减链路横跨订单、仓储与支付模块，峰值时存在重复扣减与状态回滚不一致风险。']
      },
      {
        id: 'design',
        title: '2. 技术方案',
        body: ['引入库存预占表与幂等流水，通过事务消息推动订单状态流转，扣减失败时进入补偿队列。']
      },
      {
        id: 'risk',
        title: '3. 风险分析',
        body: ['需重点验证高并发下的锁粒度、消息重复消费、补偿任务积压和人工干预边界。']
      },
      {
        id: 'release',
        title: '4. 发布计划',
        body: ['先按 5% 商家灰度，再逐步扩大到全量；灰度期间保留旧链路回切开关。']
      }
    ]
  },
  requirement_doc: {
    type: 'requirement_doc',
    title: '协同空间权限优化需求',
    subtitle: '需求评审记录',
    sections: [
      { id: 'goal', title: '目标', body: ['提升外部协作者加入空间后的权限识别效率，减少误操作。'] },
      { id: 'scope', title: '范围', body: ['覆盖邀请、查看、编辑、转交和移除成员等核心路径。'] },
      { id: 'flow', title: '交互流程', body: ['成员进入空间后先展示权限摘要，并在敏感操作前给出二次确认。'] },
      { id: 'metric', title: '验收指标', body: ['权限相关客服咨询量下降 30%，外部成员首次完成任务时间缩短 20%。'] }
    ]
  },
  project_plan: {
    type: 'project_plan',
    title: '项目方案讨论',
    subtitle: '跨团队推进方案',
    sections: [
      { id: 'background', title: '背景', body: ['本项目旨在提升协同过程中的信息同步效率，并统一资料沉淀方式。'] },
      { id: 'target', title: '目标', body: ['在两周内完成核心流程验证、灰度计划和上线物料准备。'] },
      { id: 'solution', title: '设计方案', body: ['采用阶段里程碑推进，每个阶段输出明确负责人、交付物和风险清单。'] },
      { id: 'timeline', title: '排期', body: ['本周完成方案评审，下周进入灰度验证，月底完成复盘。'] }
    ]
  },
  okr: {
    type: 'okr',
    title: '2026 Q3 OKR',
    subtitle: '团队目标对齐',
    sections: [
      { id: 'o1', title: 'O1 提升系统稳定性', body: ['KR1 核心链路可用性达到 99.95%。', 'KR2 P0 事故数环比下降 50%。'] },
      { id: 'o2', title: 'O2 提升协同效率', body: ['KR1 需求平均评审周期缩短至 2 天内。', 'KR2 知识库有效文档覆盖率达到 90%。'] },
      { id: 'o3', title: 'O3 建立增长实验机制', body: ['KR1 完成 6 个有效实验。', 'KR2 输出可复用实验模板。'] }
    ]
  },
  meeting_notes: {
    type: 'meeting_notes',
    title: '需求评审会议纪要',
    subtitle: '会议纪要',
    sections: [
      { id: 'info', title: '会议信息', body: ['时间：周三 14:00-15:00；参与方：产品、设计、研发、测试。'] },
      { id: 'topic', title: '讨论议题', body: ['确认 MVP 范围、灰度策略、数据口径和上线风险。'] },
      { id: 'decision', title: '会议结论', body: ['本期先收敛到核心协作场景，二期再补充管理后台能力。'] },
      { id: 'todo', title: '待办事项', body: ['产品补充验收标准，研发拆分技术任务，测试准备回归用例。'] }
    ]
  },
  knowledge_base: {
    type: 'knowledge_base',
    title: '团队知识库',
    subtitle: '知识库条目',
    sections: [
      { id: 'intro', title: '简介', body: ['本文档沉淀团队协作流程、常见问题与关键系统说明。'] },
      { id: 'process', title: '流程规范', body: ['所有需求需经过立项、评审、开发、验收和复盘五个阶段。'] },
      { id: 'faq', title: '常见问题', body: ['权限、环境、数据口径和发布窗口问题统一在此维护。'] },
      { id: 'appendix', title: '附录', body: ['相关链接、模板和负责人信息按季度更新。'] }
    ]
  },
  product_roadmap: {
    type: 'product_roadmap',
    title: '产品规划 2026',
    subtitle: '路线图草案',
    sections: [
      { id: 'vision', title: '产品愿景', body: ['让跨团队协作过程更轻、更透明，并降低上下文切换成本。'] },
      { id: 'q3', title: 'Q3 重点', body: ['完成核心协作链路、附件管理和权限体验优化。'] },
      { id: 'q4', title: 'Q4 重点', body: ['补齐数据分析、自动化提醒和组织级模板。'] },
      { id: 'risk', title: '潜在风险', body: ['需控制功能膨胀，保证第一屏始终保持文档产品心智。'] }
    ]
  }
};

export function getDocumentShell(type?: DocumentType | null): DocumentShell {
  if (type && documentTemplates[type]) {
    return documentTemplates[type];
  }

  const values = Object.values(documentTemplates);
  return values[Math.floor(Math.random() * values.length)];
}

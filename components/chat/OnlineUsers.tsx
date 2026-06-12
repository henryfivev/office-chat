import { Users } from 'lucide-react';

export function OnlineUsers({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
      <Users size={16} />
      <span>{count} 人在线</span>
    </div>
  );
}

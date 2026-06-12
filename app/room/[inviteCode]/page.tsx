import { ChatRoom } from '@/components/chat/ChatRoom';

export default function RoomPage({
  params
}: {
  params: {
    inviteCode: string;
  };
}) {
  return <ChatRoom inviteCode={params.inviteCode.toUpperCase()} />;
}

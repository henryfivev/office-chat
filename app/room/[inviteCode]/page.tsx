import { DocumentRoom } from '@/components/document/DocumentRoom';

export default function RoomPage({
  params
}: {
  params: {
    inviteCode: string;
  };
}) {
  return <DocumentRoom inviteCode={params.inviteCode.toUpperCase()} />;
}

export type ThemeType = 'feishu' | 'dingtalk' | 'tencent_doc';

export type MessageType = 'text' | 'image';

export interface Room {
  id: string;
  name: string;
  invite_code: string;
  theme: ThemeType;
  created_by: string | null;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  type: MessageType;
  content: string | null;
  file_url: string | null;
  status: 'normal' | 'deleted';
  created_at: string;
}

export interface PresenceUser {
  user_id: string;
  nickname: string;
  online_at: string;
}

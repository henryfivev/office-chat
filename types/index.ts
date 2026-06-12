export type ThemeType = 'feishu' | 'dingtalk' | 'tencent_doc';

export type DocumentType =
  | 'technical_design'
  | 'requirement_doc'
  | 'project_plan'
  | 'okr'
  | 'meeting_notes'
  | 'knowledge_base'
  | 'product_roadmap';

export type CommentType = 'text' | 'image';

export interface Room {
  id: string;
  name: string;
  invite_code: string;
  theme: ThemeType;
  document_type: DocumentType;
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

export interface Comment {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  type: CommentType;
  content: string | null;
  file_url: string | null;
  status: 'normal' | 'deleted';
  created_at: string;
}

export type ChatMessage = Comment;

export interface DocumentSection {
  id: string;
  title: string;
  body: string[];
}

export interface DocumentShell {
  type: DocumentType;
  title: string;
  subtitle: string;
  sections: DocumentSection[];
}

export interface PresenceUser {
  user_id: string;
  nickname: string;
  online_at: string;
}

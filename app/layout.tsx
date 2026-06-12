import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OfficeChat',
  description: '无需自建服务器的文档伪装聊天室'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

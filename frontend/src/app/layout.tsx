import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TripEasy - Quản lý du lịch thông minh',
  description: 'Ứng dụng quản lý du lịch toàn diện với tính năng chia tiền thông minh',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripEasy',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

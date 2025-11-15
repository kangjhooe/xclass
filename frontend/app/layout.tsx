import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CLASS - Sistem Manajemen Sekolah',
  description: 'Sistem Manajemen Sekolah Multi-Tenant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}


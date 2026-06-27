import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'CareerPilot AI - Получите работу мечты с AI-инструментами',
  description: 'AI-анализ резюме, подбор вакансий и генерация сопроводительных писем. Получите ATS-оценку, адаптированное резюме и персональную стратегию поиска работы.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


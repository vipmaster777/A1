import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Zodiac HR Fit',
  description: 'MVP для проверки совместимости кандидата с вакансией'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <div className="mx-auto min-h-screen max-w-5xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Zodiac HR Fit</h1>
            <nav className="flex gap-4 text-sm">
              <Link className="hover:underline" href="/">Проверка</Link>
              <Link className="hover:underline" href="/roles">Профили вакансий</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

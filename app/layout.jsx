import "@/styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "Zodiac HR Fit",
  description: "MVP для проверки совместимости кандидата и вакансии",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-slate-100 text-slate-900">
        <header className="border-b bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
            <h1 className="text-lg font-semibold">Zodiac HR Fit</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:text-blue-600">Проверка кандидата</Link>
              <Link href="/roles" className="hover:text-blue-600">Профили вакансий</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl p-4">{children}</main>
      </body>
    </html>
  );
}

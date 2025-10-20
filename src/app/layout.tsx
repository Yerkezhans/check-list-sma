import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-montserrat',
});


export const metadata: Metadata = {
  title: "Калькулятор риска СМА",
  description: "Калькулятор риска СМА",
  keywords: "Калькулятор риска СМА"
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale} className={`${montserrat.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
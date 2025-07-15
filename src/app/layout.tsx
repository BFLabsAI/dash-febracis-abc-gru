import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Febracis - Geração de Demanda",
  description: "Dashboard para análise de leads e demanda da Febracis ABC & GRU",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}

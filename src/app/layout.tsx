import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/DataContext";
import { DocumentProvider } from "@/lib/DocumentContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { DrawerProvider } from "@/lib/DrawerContext";
import I18nInit from "@/components/I18nInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vela Textile — Digital Product Passport",
  description: "Pasaporte Digital de Producto para VT-CAM-001",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <I18nInit>
            <DataProvider>
              <DocumentProvider>
                <DrawerProvider>
                  {children}
                </DrawerProvider>
              </DocumentProvider>
            </DataProvider>
          </I18nInit>
        </ThemeProvider>
      </body>
    </html>
  );
}

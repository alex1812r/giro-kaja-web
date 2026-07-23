import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";

import { AppProviders } from "@/app/providers/app-providers";
import { themeStorageKey } from "@/shared/theme";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const themeScript = `
  try {
    var theme = localStorage.getItem("${themeStorageKey}");
    var resolved = theme === "dark" || theme === "light" ? theme : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";
  }
`;

export const metadata: Metadata = {
  title: "Giro Kaja",
  description: "Control de préstamos personales y caja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-background font-sans text-text-main" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

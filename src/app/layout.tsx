import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { JotaiProvider } from "@/components/providers/jotai-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://maltese.app"),
  title: "말장난 말티즈",
  description: "말난장 말치즈",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "말장난 말티즈",
    description: "말난장 말치즈",
    url: "https://maltese.app",
    siteName: "말장난 말티즈",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "말장난 말티즈",
    description: "말난장 말치즈",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`antialiased`}>
        <ConvexClientProvider>
          <JotaiProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                className: "w-full sm:w-[var(--width)]",
              }}
              expand
              visibleToasts={3}
            />

            <main>{children}</main>

            <div id="dialog-root" />

            <div id="toast-root" />

            <Analytics />
          </JotaiProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

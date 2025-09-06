import type { Metadata } from "next";
import "./globals.css";
import { koKR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { JotaiProvider } from "@/components/providers/jotai-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "말장난 말티즈",
  description: "말난장 말치즈",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`antialiased`}>
        <ClerkProvider localization={koKR}>
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
            </JotaiProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

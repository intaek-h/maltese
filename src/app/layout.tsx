import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { JotaiProvider } from "@/components/providers/jotai-provider";

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
        <ConvexClientProvider>
          <JotaiProvider>
            <main>{children}</main>

            <div id="dialog-root" />

            <Toaster
              position="top-center"
              toastOptions={{
                className: "w-full sm:w-[var(--width)]",
              }}
              expand
              visibleToasts={3}
            />
          </JotaiProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

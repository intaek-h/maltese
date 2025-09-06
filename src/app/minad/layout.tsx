import type { Metadata } from "next";
import { AuthenticatedProvider } from "./_components/authenticated";
import { Nav } from "./_components/nav";

export const metadata: Metadata = {
  title: "말장난 말티즈 | 어드민",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthenticatedProvider>
      <main className="max-w-[1600px] m-auto px-4">
        <div className="mt-10 mb-10">
          <Nav />
        </div>

        <div>{children}</div>
      </main>
    </AuthenticatedProvider>
  );
}

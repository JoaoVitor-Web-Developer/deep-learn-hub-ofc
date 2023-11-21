import Navbar from "@/components/Navbar";
import "./globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Provider } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

const lexend = Lexend({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Deep Learn Hub",
//   description: "Seu aprendizado com IA",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={cn(lexend.className, "antialiased min-h-screen pt-16")}>
        <Provider>
          <Navbar />
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/shared/auth/session-provider";
import { Navbar } from "@/shared/ui/navbar";
import { NavBottom } from "@/shared/ui/nav-bottom";
import { Analytics } from "@vercel/analytics/next";
import { AccessTracker } from "@/shared/analytics/access-tracker";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Urus Barbearia",
  description: "Agendamento de servicos da Urus barbearia | A melhor barbearia de Salvador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${poppins.variable} antialiased`}
      >
        <AuthSessionProvider>
          <AccessTracker />
          <Navbar />
          {children}
          <NavBottom />
        </AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

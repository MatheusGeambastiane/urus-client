import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, Poppins } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/shared/auth/session-provider";
import { Navbar } from "@/shared/ui/navbar";
import { NavBottom } from "@/shared/ui/nav-bottom";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
        className={`${bricolage.variable} ${manrope.variable} ${poppins.variable} antialiased`}
      >
        <AuthSessionProvider>
          <Navbar />
          {children}
          <NavBottom />
        </AuthSessionProvider>
      </body>
    </html>
  );
}

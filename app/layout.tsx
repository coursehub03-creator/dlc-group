import type { Metadata } from "next";
import "@/styles/globals.css";
import { brand } from "@/config/brand";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  title: `${brand.nameEn} | ${brand.nameFullEn}`,
  description: "Multilingual legal consulting platform for consultations, IP, monitoring, and case management.",
  openGraph: { title: brand.nameFullEn, description: "Premium legal consulting platform", url: `https://${brand.domain}` }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}

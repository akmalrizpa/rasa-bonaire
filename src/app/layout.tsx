import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { currentUser } from "@/lib/auth";
import { closesAt } from "@/lib/slots";
import { getSettings } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const dynamic = "force-dynamic";

// viewport-fit=cover lets the layout use the iPhone safe areas, and themeColor
// paints the browser bar in the sand tone so the shop does not look boxed in.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf6ef",
};

export const metadata: Metadata = {
  title: {
    default: "Rasa Bonaire — preorder Indonesian and island food",
    template: "%s · Rasa Bonaire",
  },
  description:
    "Preorder rendang, sate, keshi yena and funchi from Kaya Grandi 24 in Kralendijk. Pick your batch slot, pay online, collect it warm.",
  keywords: [
    "preorder food Bonaire",
    "Indonesian food Kralendijk",
    "rendang Bonaire",
    "keshi yena",
    "warung Bonaire",
  ],
  openGraph: {
    title: "Rasa Bonaire — preorder Indonesian and island food",
    description:
      "Order in the morning, collect inside your slot on Kaya Grandi. Rendang, sate, keshi yena, funchi.",
    type: "website",
    locale: "en_US",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([currentUser(), getSettings()]);

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <AppProviders>
          <Header user={user} settings={settings} closesAtIso={closesAt().toISOString()} />
          {/* min-w-0 matters: as a flex item main would otherwise stretch to the
              widest thing inside it instead of the width of the screen. */}
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}

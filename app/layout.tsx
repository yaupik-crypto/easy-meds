import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { EasyMedsStoreProvider } from "@/lib/store"
import { EASY_MEDS } from "@/lib/config"
import { AppShell } from "@/components/shell"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-em-sans",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: `${EASY_MEDS.name} — medication & supplement organiser`,
    template: `%s · ${EASY_MEDS.name}`,
  },
  description:
    "Keep every medication and supplement for you and the people you care for in one calm place: dose reminders, food instructions, history, and a clash check before you add anything new.",
  applicationName: EASY_MEDS.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: EASY_MEDS.name,
    statusBarStyle: "default",
  },
  robots: { index: false, follow: false },
  openGraph: {
    title: EASY_MEDS.name,
    description: EASY_MEDS.tagline,
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen antialiased">
        <EasyMedsStoreProvider>
          <AppShell>{children}</AppShell>
        </EasyMedsStoreProvider>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthWrapper } from "@/components/auth-wrapper"
import { SyncStatus } from "@/components/sync-status"
import { Toaster } from "@/components/ui/toaster"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { PWAUpdatePrompt } from "@/components/pwa-update-prompt"
import { PWAStatus } from "@/components/pwa-status"

export const metadata: Metadata = {
  title: "Gestão Administrativa - Curso de Aperfeiçoamento Escola Quilombo",
  description: "Plataforma de gestão educacional para o fortalecimento da educação quilombola e práticas antirracistas",
  generator: "v0.dev",
  manifest: "/manifest.json",
  themeColor: "#FF6B35",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quilombo Admin",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthWrapper>
          {children}
          <SyncStatus />
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
          <PWAStatus />
          <Toaster />
        </AuthWrapper>
      </body>
    </html>
  )
}

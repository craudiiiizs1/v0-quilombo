import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthWrapper } from "@/components/auth-wrapper"
import { SyncStatus } from "@/components/sync-status"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Gestão Administrativa - Curso de Aperfeiçoamento Escola Quilombo",
  description: "Plataforma de gestão educacional para o fortalecimento da educação quilombola e práticas antirracistas",
  generator: "v0.dev",
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
          <Toaster />
        </AuthWrapper>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SyncStatus } from "@/components/sync-status"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Sistema de Gestão Educacional",
  description: "Plataforma completa para gerenciamento de projetos educacionais",
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
        {children}
        <SyncStatus />
        <Toaster />
      </body>
    </html>
  )
}

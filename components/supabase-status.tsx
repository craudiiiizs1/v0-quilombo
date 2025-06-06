"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, AlertTriangle } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function SupabaseStatus() {
  if (isSupabaseConfigured) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <Database className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Conectado ao Supabase. Dados sendo salvos permanentemente.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Modo Demo:</strong> Usando dados locais. Configure o Supabase para persistência real.{" "}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          Criar projeto Supabase
        </a>
      </AlertDescription>
    </Alert>
  )
}

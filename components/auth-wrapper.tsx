"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { LoginPage } from "@/components/login-page"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quilombo-orange/10 to-quilombo-turquoise/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-quilombo-orange/30 border-t-quilombo-orange rounded-full animate-spin mx-auto mb-4" />
          <p className="text-quilombo-green font-medium">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}

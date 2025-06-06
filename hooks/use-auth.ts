"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const DEFAULT_PASSWORD = "quilombo2024" // Senha padrão - pode ser alterada conforme necessário

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkAuth = () => {
      const authStatus = localStorage.getItem("quilombo_auth")
      const authTimestamp = localStorage.getItem("quilombo_auth_timestamp")

      if (authStatus === "authenticated" && authTimestamp) {
        // Verificar se a autenticação não expirou (24 horas)
        const now = new Date().getTime()
        const authTime = Number.parseInt(authTimestamp)
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (now - authTime < twentyFourHours) {
          setIsAuthenticated(true)
        } else {
          // Autenticação expirada
          logout()
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (password: string): boolean => {
    if (password === DEFAULT_PASSWORD) {
      localStorage.setItem("quilombo_auth", "authenticated")
      localStorage.setItem("quilombo_auth_timestamp", new Date().getTime().toString())
      setIsAuthenticated(true)

      // Forçar atualização da página para garantir que o estado seja aplicado
      window.location.href = "/"
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("quilombo_auth")
    localStorage.removeItem("quilombo_auth_timestamp")
    setIsAuthenticated(false)

    // Forçar atualização da página para garantir que o estado seja aplicado
    window.location.href = "/"
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

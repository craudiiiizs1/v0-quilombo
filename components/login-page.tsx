"use client"

import type React from "react"
import { CheckCircle, Eye, EyeOff, Lock, Shield } from "lucide-react" // Import CheckCircle icon

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AfricanPattern } from "@/components/african-pattern"
import { useAuth } from "@/hooks/use-auth"

export function LoginPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simular um pequeno delay para melhor UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      const isSuccess = login(password)

      if (isSuccess) {
        setSuccess(true)
        // O redirecionamento será feito pelo hook useAuth
      } else {
        setError("Senha incorreta. Tente novamente.")
        setPassword("")
      }
    } catch (error) {
      setError("Erro ao processar login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quilombo-orange/10 to-quilombo-turquoise/10 flex items-center justify-center p-4">
      {/* Padrão africano no topo */}
      <div className="absolute top-0 left-0 right-0">
        <AfricanPattern variant="top" />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-2 border-quilombo-orange/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-quilombo-orange to-quilombo-orange-light rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-quilombo-green">Acesso Restrito</CardTitle>
              <CardDescription className="text-quilombo-green/70 mt-2">
                Sistema de Gestão Administrativa
              </CardDescription>
              <CardDescription className="text-sm font-medium text-quilombo-orange mt-1">
                Curso de Aperfeiçoamento Escola Quilombo
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {success ? (
              <Alert className="border-green-200 bg-green-50 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Login bem-sucedido! Redirecionando...</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-quilombo-green font-medium">
                    Senha de Acesso
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a senha de acesso"
                      className="pr-10 border-quilombo-orange/30 focus:border-quilombo-orange focus:ring-quilombo-orange/20"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-quilombo-green/60" />
                      ) : (
                        <Eye className="h-4 w-4 text-quilombo-green/60" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <Lock className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-quilombo-orange to-quilombo-orange-light hover:from-quilombo-orange/90 hover:to-quilombo-orange-light/90 text-white font-medium py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Acessar Sistema
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-quilombo-orange/20">
              <div className="text-center space-y-2">
                <p className="text-xs text-quilombo-green/60">Sistema protegido por senha</p>
                <p className="text-xs text-quilombo-green/60">Dados sensíveis - Acesso autorizado apenas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-quilombo-orange/20">
            <h3 className="text-sm font-semibold text-quilombo-green mb-2">Projeto Escola Quilombo - PNEERQ</h3>
            <p className="text-xs text-quilombo-green/70">
              Política Nacional de Equidade, Educação para as Relações Étnico-Raciais e Educação Escolar Quilombola
            </p>
          </div>
        </div>
      </div>

      {/* Padrão africano na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <AfricanPattern variant="bottom" />
      </div>
    </div>
  )
}

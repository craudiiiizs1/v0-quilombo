"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, X } from "lucide-react"
import { pwaManager } from "@/lib/pwa-manager"
import { useToast } from "@/hooks/use-toast"

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent) => {
      console.log("Nova atualização disponível")
      setShowUpdatePrompt(true)
    }

    window.addEventListener("pwa-update-available", handleUpdateAvailable as EventListener)

    return () => {
      window.removeEventListener("pwa-update-available", handleUpdateAvailable as EventListener)
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)

    try {
      await pwaManager.updateServiceWorker()

      toast({
        title: "Atualização Aplicada",
        description: "O aplicativo foi atualizado com sucesso.",
      })
    } catch (error) {
      console.error("Erro na atualização:", error)
      toast({
        title: "Erro na Atualização",
        description: "Ocorreu um erro ao atualizar o aplicativo.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setShowUpdatePrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Card className="shadow-2xl border-2 border-blue-500/30 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-700">Atualização Disponível</CardTitle>
                <CardDescription className="text-sm">Nova versão do aplicativo</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Uma nova versão está disponível com melhorias e correções.</p>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Atualizando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </div>
                )}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-700 hover:bg-blue-50"
              >
                Depois
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

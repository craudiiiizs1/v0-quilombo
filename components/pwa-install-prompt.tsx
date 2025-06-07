"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, X, Smartphone, WifiOff, Shield, AlertTriangle, Info } from "lucide-react"
import { pwaManager } from "@/lib/pwa-manager"
import { useToast } from "@/hooks/use-toast"

export function PWAInstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showSecurityWarning, setShowSecurityWarning] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [swError, setSwError] = useState<string | null>(null)
  const [pwaStatus, setPwaStatus] = useState(pwaManager.getStatus())
  const { toast } = useToast()

  useEffect(() => {
    // Atualizar status PWA
    setPwaStatus(pwaManager.getStatus())

    // Verificar contexto seguro
    if (!pwaManager.isInSecureContext) {
      setShowSecurityWarning(true)
    }

    // Verificar se pode mostrar o prompt
    const checkInstallAvailability = () => {
      if (pwaManager.canInstall && !pwaManager.isAppInstalled) {
        setShowInstallPrompt(true)
      }
    }

    // Eventos PWA
    const handleInstallAvailable = () => {
      setShowInstallPrompt(true)
    }

    const handleInstalled = () => {
      setShowInstallPrompt(false)
      setPwaStatus(pwaManager.getStatus())
      toast({
        title: "App Instalado!",
        description: "O aplicativo foi instalado com sucesso em seu dispositivo.",
      })
    }

    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Conexão Restaurada",
        description: "Você está online novamente. Dados serão sincronizados.",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Modo Offline",
        description: "Você está offline. O app continuará funcionando com dados locais.",
        variant: "destructive",
      })
    }

    const handleSWError = (event: CustomEvent) => {
      setSwError(event.detail.error)
      console.error("Service Worker Error:", event.detail.error)
    }

    // Verificar estado inicial
    setIsOnline(navigator.onLine)
    checkInstallAvailability()

    // Adicionar listeners
    window.addEventListener("pwa-install-available", handleInstallAvailable)
    window.addEventListener("pwa-installed", handleInstalled)
    window.addEventListener("pwa-online", handleOnline)
    window.addEventListener("pwa-offline", handleOffline)
    window.addEventListener("pwa-sw-error", handleSWError as EventListener)

    return () => {
      window.removeEventListener("pwa-install-available", handleInstallAvailable)
      window.removeEventListener("pwa-installed", handleInstalled)
      window.removeEventListener("pwa-online", handleOnline)
      window.removeEventListener("pwa-offline", handleOffline)
      window.removeEventListener("pwa-sw-error", handleSWError as EventListener)
    }
  }, [toast])

  const handleInstall = async () => {
    if (!pwaManager.isInSecureContext) {
      toast({
        title: "Contexto Inseguro",
        description: "A instalação PWA requer HTTPS. Acesse via https:// para instalar.",
        variant: "destructive",
      })
      return
    }

    setIsInstalling(true)

    try {
      const success = await pwaManager.promptInstall()

      if (success) {
        setShowInstallPrompt(false)
      } else {
        toast({
          title: "Instalação Cancelada",
          description: "A instalação do aplicativo foi cancelada.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro na instalação:", error)
      toast({
        title: "Erro na Instalação",
        description: "Ocorreu um erro ao tentar instalar o aplicativo.",
        variant: "destructive",
      })
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setShowSecurityWarning(false)
    setSwError(null)

    // Não mostrar novamente por 24 horas
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  // Verificar se foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedTime = Number.parseInt(dismissed)
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (now - dismissedTime < twentyFourHours) {
        setShowInstallPrompt(false)
        setShowSecurityWarning(false)
      }
    }
  }, [])

  return (
    <>
      <ConnectionStatus isOnline={isOnline} />

      {/* Aviso de Service Worker Error */}
      {swError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Funcionalidade Limitada:</strong> Service Worker não pôde ser registrado. O app funciona
              normalmente, mas sem recursos offline avançados.
              <Button variant="ghost" size="sm" onClick={() => setSwError(null)} className="ml-2 h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Aviso de Contexto Inseguro */}
      {showSecurityWarning && !pwaManager.isInSecureContext && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm">
          <Card className="shadow-2xl border-2 border-yellow-500/30 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-yellow-700">Contexto HTTP</CardTitle>
                    <CardDescription className="text-sm">Funcionalidades PWA limitadas</CardDescription>
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
                <div className="text-sm text-gray-600">
                  <p className="mb-2">O app funciona normalmente, mas para recursos PWA completos:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Acesse via HTTPS</li>
                    <li>• Instalação como app nativo</li>
                    <li>• Funcionamento offline completo</li>
                    <li>• Notificações push</li>
                  </ul>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>Status:</strong> Service Worker:{" "}
                    {pwaStatus.hasServiceWorkerSupport ? "Suportado" : "Não Suportado"} | Contexto:{" "}
                    {pwaStatus.isSecureContext ? "Seguro" : "Inseguro"}
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="w-full border-yellow-500/30 text-yellow-700 hover:bg-yellow-50"
                >
                  Entendi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt de Instalação */}
      {showInstallPrompt && pwaManager.isInSecureContext && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm">
          <Card className="shadow-2xl border-2 border-quilombo-orange/30 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-quilombo-orange to-quilombo-orange-light rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-quilombo-green">Instalar App</CardTitle>
                    <CardDescription className="text-sm">Acesso rápido e uso offline</CardDescription>
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
                <div className="text-sm text-gray-600">
                  <ul className="space-y-1">
                    <li>• Funciona sem internet</li>
                    <li>• Acesso direto da tela inicial</li>
                    <li>• Sincronização automática</li>
                    <li>• Notificações importantes</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex-1 bg-quilombo-orange hover:bg-quilombo-orange/90 text-white"
                    size="sm"
                  >
                    {isInstalling ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Instalando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Instalar
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="border-quilombo-orange/30 text-quilombo-green hover:bg-quilombo-orange/10"
                  >
                    Depois
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        Modo Offline - Dados locais em uso
      </div>
    </div>
  )
}

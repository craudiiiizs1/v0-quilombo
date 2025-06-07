"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Smartphone,
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  Bell,
  CheckCircle,
  Info,
  Shield,
  AlertTriangle,
  X,
} from "lucide-react"
import { usePWA } from "@/hooks/use-pwa"
import { pwaManager } from "@/lib/pwa-manager"
import { useToast } from "@/hooks/use-toast"

export function PWAStatus() {
  const [showDetails, setShowDetails] = useState(false)
  const pwa = usePWA()
  const { toast } = useToast()

  const handleInstall = async () => {
    if (!pwaManager.isInSecureContext) {
      toast({
        title: "Contexto Inseguro",
        description: "A instalação PWA requer HTTPS. Acesse via https:// para instalar.",
        variant: "destructive",
      })
      return
    }

    const success = await pwa.install()
    if (success) {
      toast({
        title: "Instalação Iniciada",
        description: "O aplicativo está sendo instalado...",
      })
    }
  }

  const handleUpdate = async () => {
    await pwa.update()
    toast({
      title: "Atualização Aplicada",
      description: "O aplicativo foi atualizado com sucesso.",
    })
  }

  const handleNotificationTest = async () => {
    if (!pwaManager.isInSecureContext) {
      toast({
        title: "Contexto Inseguro",
        description: "Notificações requerem HTTPS.",
        variant: "destructive",
      })
      return
    }

    const permission = await pwa.requestNotificationPermission()

    if (permission === "granted") {
      await pwa.showNotification("Teste de Notificação", {
        body: "As notificações estão funcionando corretamente!",
        icon: "/icons/icon-192x192.png",
      })

      toast({
        title: "Notificação Enviada",
        description: "Verifique se a notificação apareceu.",
      })
    } else {
      toast({
        title: "Permissão Negada",
        description: "Permissão para notificações foi negada.",
        variant: "destructive",
      })
    }
  }

  if (!showDetails) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 left-4 z-40 bg-white/90 backdrop-blur-sm"
      >
        <Info className="h-4 w-4 mr-2" />
        PWA Status
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="shadow-2xl border-2 border-quilombo-orange/20 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-quilombo-green">Status PWA</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Informações sobre o aplicativo</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Aviso de Contexto Inseguro */}
          {!pwaManager.isInSecureContext && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs">
                <strong>Contexto Inseguro:</strong> Algumas funcionalidades PWA estão limitadas. Acesse via HTTPS para
                experiência completa.
              </AlertDescription>
            </Alert>
          )}

          {/* Status de Segurança */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${pwaManager.isInSecureContext ? "text-green-600" : "text-yellow-600"}`} />
              <span className="text-sm font-medium">Segurança</span>
            </div>
            <Badge
              className={pwaManager.isInSecureContext ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
            >
              {pwaManager.isInSecureContext ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Seguro (HTTPS)
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Inseguro (HTTP)
                </>
              )}
            </Badge>
          </div>

          {/* Status de Instalação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-quilombo-orange" />
              <span className="text-sm font-medium">Instalação</span>
            </div>
            {pwa.isInstalled ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Instalado
              </Badge>
            ) : pwa.canInstall ? (
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={pwa.isInstalling}
                className="bg-quilombo-orange hover:bg-quilombo-orange/90 text-white"
              >
                {pwa.isInstalling ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Download className="h-3 w-3 mr-1" />
                )}
                {pwa.isInstalling ? "Instalando..." : "Instalar"}
              </Button>
            ) : (
              <Badge variant="secondary">{pwaManager.isInSecureContext ? "Não Disponível" : "Requer HTTPS"}</Badge>
            )}
          </div>

          {/* Status de Conexão */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pwa.isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Conexão</span>
            </div>
            <Badge className={pwa.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {pwa.isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Status de Atualização */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Atualização</span>
            </div>
            {pwa.isUpdateAvailable ? (
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={pwa.isUpdating}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                {pwa.isUpdating ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                {pwa.isUpdating ? "Atualizando..." : "Atualizar"}
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Atualizado
              </Badge>
            )}
          </div>

          {/* Teste de Notificações */}
          <div className="pt-2 border-t">
            <Button
              size="sm"
              onClick={handleNotificationTest}
              variant="outline"
              className="w-full border-quilombo-orange/30 text-quilombo-green hover:bg-quilombo-orange/10"
              disabled={!pwaManager.isInSecureContext}
            >
              <Bell className="h-4 w-4 mr-2" />
              {pwaManager.isInSecureContext ? "Testar Notificações" : "Notificações (Requer HTTPS)"}
            </Button>
          </div>

          {/* Informações Técnicas */}
          <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
            <div>
              Service Worker:{" "}
              {pwaManager.hasServiceWorkerSupport
                ? pwaManager.serviceWorkerRegistration
                  ? "Ativo"
                  : "Não Registrado"
                : "Não Suportado"}
            </div>
            <div>Cache: {typeof caches !== "undefined" ? "Suportado" : "Não Suportado"}</div>
            <div>IndexedDB: {typeof indexedDB !== "undefined" ? "Suportado" : "Não Suportado"}</div>
            <div>Contexto: {pwaManager.isInSecureContext ? "Seguro" : "Inseguro"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

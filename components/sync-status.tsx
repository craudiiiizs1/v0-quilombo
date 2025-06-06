"use client"

import { useState } from "react"
import { Cloud, CloudOff, FolderSyncIcon as Sync, AlertTriangle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSync } from "@/hooks/use-sync"
import { isSupabaseConfigured } from "@/lib/supabase"

export function SyncStatus() {
  const { syncStatus, syncAllData, clearLocalData } = useSync()
  const [showDetails, setShowDetails] = useState(false)

  if (!isSupabaseConfigured && syncStatus.pendingChanges === 0) {
    return null
  }

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <Sync className="h-4 w-4 animate-spin text-blue-600" />
    }
    if (!syncStatus.isOnline) {
      return <CloudOff className="h-4 w-4 text-red-600" />
    }
    if (syncStatus.hasConflicts) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
    if (syncStatus.pendingChanges > 0) {
      return <Cloud className="h-4 w-4 text-orange-600" />
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getStatusText = () => {
    if (syncStatus.isSyncing) return "Sincronizando..."
    if (!isSupabaseConfigured) return "Offline"
    if (!syncStatus.isOnline) return "Desconectado"
    if (syncStatus.hasConflicts) return "Conflitos"
    if (syncStatus.pendingChanges > 0) return "Pendente"
    return "Sincronizado"
  }

  const getStatusColor = () => {
    if (syncStatus.isSyncing) return "bg-blue-100 text-blue-800"
    if (!syncStatus.isOnline) return "bg-red-100 text-red-800"
    if (syncStatus.hasConflicts) return "bg-yellow-100 text-yellow-800"
    if (syncStatus.pendingChanges > 0) return "bg-orange-100 text-orange-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white shadow-lg border-2 hover:shadow-xl transition-all">
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
            {syncStatus.pendingChanges > 0 && (
              <Badge variant="secondary" className="ml-2">
                {syncStatus.pendingChanges}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Status de Sincronização
            </DialogTitle>
            <DialogDescription>Informações sobre a sincronização de dados</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor()}>{getStatusText()}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conexão:</span>
              <span className="text-sm">
                {isSupabaseConfigured ? (syncStatus.isOnline ? "Online" : "Offline") : "Não configurado"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dados pendentes:</span>
              <span className="text-sm">{syncStatus.pendingChanges} registros</span>
            </div>

            {syncStatus.lastSync && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última sincronização:</span>
                <span className="text-sm">{syncStatus.lastSync.toLocaleString("pt-BR")}</span>
              </div>
            )}

            {syncStatus.hasConflicts && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Conflitos detectados. Alguns dados locais já existem no servidor.
                </AlertDescription>
              </Alert>
            )}

            {!isSupabaseConfigured && syncStatus.pendingChanges > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Cloud className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Configure o Supabase para sincronizar automaticamente os dados locais.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              {isSupabaseConfigured && syncStatus.pendingChanges > 0 && (
                <Button onClick={syncAllData} disabled={syncStatus.isSyncing} size="sm" className="flex-1">
                  {syncStatus.isSyncing ? (
                    <Sync className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Cloud className="h-4 w-4 mr-2" />
                  )}
                  Sincronizar
                </Button>
              )}

              {syncStatus.pendingChanges > 0 && (
                <Button onClick={clearLocalData} variant="outline" size="sm" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

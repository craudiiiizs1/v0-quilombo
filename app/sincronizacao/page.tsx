"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle, CheckCircle, Download, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSync } from "@/hooks/use-sync"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Conflict {
  local: any
  remote: any
  table: string
}

export default function Sincronizacao() {
  const { syncStatus, syncAllData, clearLocalData } = useSync()
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [resolving, setResolving] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadConflicts = () => {
      const storedConflicts = localStorage.getItem("sync_conflicts")
      if (storedConflicts) {
        setConflicts(JSON.parse(storedConflicts))
      }
    }

    loadConflicts()
  }, [])

  const resolveConflict = async (conflict: Conflict, useLocal: boolean) => {
    setResolving(`${conflict.table}-${conflict.local.id}`)

    try {
      if (useLocal) {
        // Atualizar com dados locais
        const { id, created_at, municipios, ...localData } = conflict.local
        const { error } = await supabase.from(conflict.table).update(localData).eq("id", conflict.remote.id)

        if (error) throw error
      }
      // Se usar remoto, não precisa fazer nada - dados já estão no servidor

      // Remover conflito da lista
      const updatedConflicts = conflicts.filter(
        (c) => !(c.table === conflict.table && c.local.id === conflict.local.id),
      )
      setConflicts(updatedConflicts)
      localStorage.setItem("sync_conflicts", JSON.stringify(updatedConflicts))

      toast({
        title: "Conflito Resolvido",
        description: `Dados ${useLocal ? "locais" : "remotos"} mantidos.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao resolver conflito.",
        variant: "destructive",
      })
    } finally {
      setResolving(null)
    }
  }

  const exportLocalData = () => {
    const tables = ["reunioes", "tutores", "supervisores", "cursistas", "formadores"]
    const exportData = {}

    tables.forEach((table) => {
      const data = localStorage.getItem(table)
      if (data) {
        exportData[table] = JSON.parse(data)
      }
    })

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dados-locais-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Dados Exportados",
      description: "Arquivo de backup criado com sucesso.",
    })
  }

  const importLocalData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        Object.keys(data).forEach((table) => {
          if (data[table] && Array.isArray(data[table])) {
            localStorage.setItem(table, JSON.stringify(data[table]))
          }
        })

        toast({
          title: "Dados Importados",
          description: "Dados locais restaurados com sucesso.",
        })

        // Recarregar página para atualizar contadores
        window.location.reload()
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              Sincronização de Dados
            </h1>
            <p className="text-gray-600">Gerencie a sincronização entre dados locais e Supabase</p>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="conflicts">
              Conflitos
              {conflicts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {conflicts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
                <CardDescription>Informações sobre o estado da sincronização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{syncStatus.isOnline ? "Online" : "Offline"}</div>
                    <div className="text-sm text-gray-600">Conexão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{syncStatus.pendingChanges}</div>
                    <div className="text-sm text-gray-600">Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{conflicts.length}</div>
                    <div className="text-sm text-gray-600">Conflitos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{syncStatus.lastSync ? "Sim" : "Não"}</div>
                    <div className="text-sm text-gray-600">Sincronizado</div>
                  </div>
                </div>

                {syncStatus.lastSync && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Última sincronização: {syncStatus.lastSync.toLocaleString("pt-BR")}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={syncAllData}
                    disabled={syncStatus.isSyncing || syncStatus.pendingChanges === 0}
                    className="flex-1"
                  >
                    {syncStatus.isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
                  </Button>
                  <Button onClick={clearLocalData} variant="outline" disabled={syncStatus.pendingChanges === 0}>
                    Limpar Dados Locais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            {conflicts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conflito encontrado</h3>
                  <p className="text-gray-600">Todos os dados estão sincronizados corretamente.</p>
                </CardContent>
              </Card>
            ) : (
              conflicts.map((conflict, index) => (
                <Card key={`${conflict.table}-${conflict.local.id}-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Conflito em {conflict.table}
                    </CardTitle>
                    <CardDescription>Dados locais e remotos diferentes para o mesmo registro</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-green-700 mb-2">Dados Locais</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Nome:</strong> {conflict.local.nome}
                          </p>
                          <p>
                            <strong>Email:</strong> {conflict.local.email}
                          </p>
                          {conflict.local.telefone && (
                            <p>
                              <strong>Telefone:</strong> {conflict.local.telefone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-blue-700 mb-2">Dados Remotos</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Nome:</strong> {conflict.remote.nome}
                          </p>
                          <p>
                            <strong>Email:</strong> {conflict.remote.email}
                          </p>
                          {conflict.remote.telefone && (
                            <p>
                              <strong>Telefone:</strong> {conflict.remote.telefone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => resolveConflict(conflict, true)}
                        disabled={resolving === `${conflict.table}-${conflict.local.id}`}
                        variant="outline"
                        className="flex-1"
                      >
                        Usar Dados Locais
                      </Button>
                      <Button
                        onClick={() => resolveConflict(conflict, false)}
                        disabled={resolving === `${conflict.table}-${conflict.local.id}`}
                        variant="outline"
                        className="flex-1"
                      >
                        Usar Dados Remotos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup de Dados</CardTitle>
                <CardDescription>Exporte ou importe dados locais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={exportLocalData} variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Exportar Dados Locais
                  </Button>
                  <div>
                    <input type="file" accept=".json" onChange={importLocalData} className="hidden" id="import-file" />
                    <label htmlFor="import-file">
                      <Button variant="outline" className="h-20 flex-col w-full" asChild>
                        <span>
                          <Upload className="h-6 w-6 mb-2" />
                          Importar Dados Locais
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Faça backup dos seus dados locais antes de sincronizar ou limpar. Os
                    dados exportados podem ser importados novamente se necessário.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

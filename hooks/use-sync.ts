"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingChanges: number
  hasConflicts: boolean
}

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: isSupabaseConfigured,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    hasConflicts: false,
  })
  const { toast } = useToast()

  // Verificar conectividade periodicamente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!isSupabaseConfigured) {
          setSyncStatus((prev) => ({ ...prev, isOnline: false }))
          return
        }

        // Teste simples de conectividade
        const { error } = await supabase.from("municipios").select("id").limit(1)

        setSyncStatus((prev) => ({
          ...prev,
          isOnline: !error,
        }))

        // Se ficou online e há dados pendentes, sincronizar
        if (!error && !syncStatus.isOnline && syncStatus.pendingChanges > 0) {
          await syncAllData()
        }
      } catch (error) {
        setSyncStatus((prev) => ({ ...prev, isOnline: false }))
      }
    }

    // Verificar imediatamente
    checkConnection()

    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [syncStatus.isOnline, syncStatus.pendingChanges])

  // Contar mudanças pendentes
  useEffect(() => {
    const countPendingChanges = () => {
      let count = 0
      const tables = [
        "reunioes",
        "tutores",
        "supervisores",
        "cursistas",
        "formadores",
        "anotacoes_reuniao_", // prefixo para localStorage
        "anotacoes_tutor_",
        "anotacoes_supervisor_",
        "anotacoes_cursista_",
        "anotacoes_formador_",
      ]

      // Modificar a lógica para contar anotações também:
      tables.forEach((table) => {
        if (table.startsWith("anotacoes_")) {
          // Para anotações, verificar todas as chaves que começam com o prefixo
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(table)) {
              const data = localStorage.getItem(key)
              if (data) {
                const items = JSON.parse(data)
                count += items.length
              }
            }
          }
        } else {
          const data = localStorage.getItem(table)
          if (data) {
            const items = JSON.parse(data)
            count += items.length
          }
        }
      })

      setSyncStatus((prev) => ({ ...prev, pendingChanges: count }))
    }

    countPendingChanges()

    // Escutar mudanças no localStorage
    window.addEventListener("storage", countPendingChanges)

    return () => window.removeEventListener("storage", countPendingChanges)
  }, [])

  const syncTable = async (tableName: string) => {
    try {
      const localData = localStorage.getItem(tableName)
      if (!localData) return { success: true, synced: 0 }

      const items = JSON.parse(localData)
      if (items.length === 0) return { success: true, synced: 0 }

      // Verificar se a tabela existe
      const { error: tableError } = await supabase.from(tableName).select("id").limit(1)
      if (tableError) {
        console.error(`Tabela ${tableName} não existe:`, tableError)
        return { success: false, error: `Tabela ${tableName} não encontrada` }
      }

      let syncedCount = 0
      const conflicts = []

      for (const item of items) {
        try {
          // Remover campos que não devem ser sincronizados
          const { id, created_at, municipios, ...itemData } = item

          // Verificar se já existe no Supabase
          const { data: existing } = await supabase.from(tableName).select("*").eq("email", item.email).single()

          if (existing) {
            // Conflito detectado - item já existe
            conflicts.push({
              local: item,
              remote: existing,
              table: tableName,
            })
          } else {
            // Inserir novo item
            const { error } = await supabase.from(tableName).insert([itemData])

            if (error) {
              console.error(`Erro ao sincronizar item de ${tableName}:`, error)
            } else {
              syncedCount++
            }
          }
        } catch (error) {
          console.error(`Erro ao processar item de ${tableName}:`, error)
        }
      }

      return {
        success: true,
        synced: syncedCount,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      }
    } catch (error) {
      console.error(`Erro ao sincronizar ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  }

  const syncAllData = useCallback(async () => {
    if (!isSupabaseConfigured || syncStatus.isSyncing) return

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }))

    try {
      const tables = [
        "reunioes",
        "tutores",
        "supervisores",
        "cursistas",
        "formadores",
        "anotacoes_reunioes",
        "anotacoes_tutores",
        "anotacoes_supervisores",
        "anotacoes_cursistas",
        "anotacoes_formadores",
      ]
      let totalSynced = 0
      let hasErrors = false
      const allConflicts = []

      for (const table of tables) {
        const result = await syncTable(table)

        if (result.success) {
          totalSynced += result.synced
          if (result.conflicts) {
            allConflicts.push(...result.conflicts)
          }
        } else {
          hasErrors = true
          console.error(`Erro ao sincronizar ${table}:`, result.error)
        }
      }

      if (totalSynced > 0) {
        // Limpar dados locais após sincronização bem-sucedida
        tables.forEach((table) => {
          if (localStorage.getItem(table)) {
            localStorage.removeItem(table)
          }
        })

        toast({
          title: "Sincronização Concluída",
          description: `${totalSynced} registros sincronizados com sucesso!`,
        })
      }

      if (allConflicts.length > 0) {
        // Salvar conflitos para resolução manual
        localStorage.setItem("sync_conflicts", JSON.stringify(allConflicts))

        toast({
          title: "Conflitos Detectados",
          description: `${allConflicts.length} conflitos encontrados. Verifique a página de sincronização.`,
          variant: "destructive",
        })
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSync: new Date(),
        hasConflicts: allConflicts.length > 0,
        pendingChanges: hasErrors ? prev.pendingChanges : 0,
      }))
    } catch (error) {
      console.error("Erro durante sincronização:", error)
      toast({
        title: "Erro na Sincronização",
        description: "Falha ao sincronizar dados. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }))
    }
  }, [isSupabaseConfigured, syncStatus.isSyncing, toast])

  const forcSync = useCallback(async () => {
    await syncAllData()
  }, [syncAllData])

  const clearLocalData = useCallback(() => {
    const tables = ["reunioes", "tutores", "supervisores", "cursistas", "formadores"]
    tables.forEach((table) => localStorage.removeItem(table))
    localStorage.removeItem("sync_conflicts")

    setSyncStatus((prev) => ({
      ...prev,
      pendingChanges: 0,
      hasConflicts: false,
    }))

    toast({
      title: "Dados Locais Limpos",
      description: "Todos os dados locais foram removidos.",
    })
  }, [toast])

  return {
    syncStatus,
    syncAllData: forcSync,
    clearLocalData,
  }
}

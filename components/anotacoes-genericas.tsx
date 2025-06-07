"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, FileText, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, isSupabaseConfigured, type AnotacaoGeneric } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AnotacoesGenericasProps {
  entityId: number
  entityType: "tutores" | "supervisores" | "cursistas" | "formadores"
  entityName: string
}

export function AnotacoesGenericas({ entityId, entityType, entityName }: AnotacoesGenericasProps) {
  const [anotacoes, setAnotacoes] = useState<AnotacaoGeneric[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnotacao, setEditingAnotacao] = useState<AnotacaoGeneric | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    autor: "",
  })

  // Configurações específicas para cada tipo de entidade
  const entityConfig = {
    tutores: {
      tableName: "anotacoes_tutores",
      foreignKey: "tutor_id",
      storageKey: `anotacoes_tutor_${entityId}`,
    },
    supervisores: {
      tableName: "anotacoes_supervisores",
      foreignKey: "supervisor_id",
      storageKey: `anotacoes_supervisor_${entityId}`,
    },
    cursistas: {
      tableName: "anotacoes_cursistas",
      foreignKey: "cursista_id",
      storageKey: `anotacoes_cursista_${entityId}`,
    },
    formadores: {
      tableName: "anotacoes_formadores",
      foreignKey: "formador_id",
      storageKey: `anotacoes_formador_${entityId}`,
    },
  }

  const config = entityConfig[entityType]

  useEffect(() => {
    fetchAnotacoes()
  }, [entityId, entityType])

  const fetchAnotacoes = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Usar dados mock do localStorage
        const storedAnotacoes = localStorage.getItem(config.storageKey)
        const anotacoes = storedAnotacoes ? JSON.parse(storedAnotacoes) : []
        setAnotacoes(anotacoes)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from(config.tableName)
        .select("*")
        .eq(config.foreignKey, entityId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAnotacoes(data || [])
    } catch (error) {
      console.error("Erro ao carregar anotações:", error)
      // Fallback para dados locais
      const storedAnotacoes = localStorage.getItem(config.storageKey)
      const anotacoes = storedAnotacoes ? JSON.parse(storedAnotacoes) : []
      setAnotacoes(anotacoes)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!isSupabaseConfigured) {
        // Lógica para localStorage
        const anotacaoData = {
          ...formData,
          [config.foreignKey]: entityId,
          id: editingAnotacao?.id || Date.now(),
        }

        const storedAnotacoes = localStorage.getItem(config.storageKey)
        let anotacoes = storedAnotacoes ? JSON.parse(storedAnotacoes) : []

        if (editingAnotacao) {
          anotacoes = anotacoes.map((a: any) =>
            a.id === editingAnotacao.id ? { ...anotacaoData, updated_at: new Date().toISOString() } : a,
          )
        } else {
          anotacaoData.created_at = new Date().toISOString()
          anotacaoData.updated_at = new Date().toISOString()
          anotacoes.unshift(anotacaoData)
        }

        localStorage.setItem(config.storageKey, JSON.stringify(anotacoes))

        toast({
          title: "Sucesso",
          description: editingAnotacao ? "Anotação atualizada com sucesso!" : "Anotação criada com sucesso!",
        })

        resetForm()
        setIsDialogOpen(false)
        fetchAnotacoes()
        return
      }

      // Lógica para Supabase
      if (editingAnotacao) {
        const { error } = await supabase
          .from(config.tableName)
          .update({
            titulo: formData.titulo,
            conteudo: formData.conteudo,
            autor: formData.autor,
          })
          .eq("id", editingAnotacao.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Anotação atualizada com sucesso!",
        })
      } else {
        const insertData = {
          titulo: formData.titulo,
          conteudo: formData.conteudo,
          autor: formData.autor,
          [config.foreignKey]: entityId,
        }

        const { error } = await supabase.from(config.tableName).insert([insertData])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Anotação criada com sucesso!",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      fetchAnotacoes()
    } catch (error) {
      console.error("Erro ao salvar anotação:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar anotação",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (anotacao: AnotacaoGeneric) => {
    setEditingAnotacao(anotacao)
    setFormData({
      titulo: anotacao.titulo,
      conteudo: anotacao.conteudo,
      autor: anotacao.autor,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return

    try {
      if (!isSupabaseConfigured) {
        const storedAnotacoes = localStorage.getItem(config.storageKey)
        let anotacoes = storedAnotacoes ? JSON.parse(storedAnotacoes) : []
        anotacoes = anotacoes.filter((a: any) => a.id !== id)
        localStorage.setItem(config.storageKey, JSON.stringify(anotacoes))

        toast({
          title: "Sucesso",
          description: "Anotação excluída com sucesso!",
        })

        fetchAnotacoes()
        return
      }

      const { error } = await supabase.from(config.tableName).delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Anotação excluída com sucesso!",
      })

      fetchAnotacoes()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir anotação",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      conteudo: "",
      autor: "",
    })
    setEditingAnotacao(null)
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Anotações sobre {entityName} ({anotacoes.length})
        </h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nova Anotação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAnotacao ? "Editar Anotação" : "Nova Anotação"}</DialogTitle>
              <DialogDescription>Adicione observações importantes sobre {entityName}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título da anotação"
                  required
                />
              </div>

              <div>
                <Label htmlFor="autor">Autor *</Label>
                <Input
                  id="autor"
                  value={formData.autor}
                  onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                  placeholder="Nome do autor da anotação"
                  required
                />
              </div>

              <div>
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea
                  id="conteudo"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Descreva observações importantes, avaliações, próximos passos..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAnotacao ? "Atualizar" : "Salvar"} Anotação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {anotacoes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Nenhuma anotação encontrada</p>
          <p className="text-xs">Clique em "Nova Anotação" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anotacoes.map((anotacao) => (
            <Card key={anotacao.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{anotacao.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      Por {anotacao.autor} • {new Date(anotacao.created_at).toLocaleString("pt-BR")}
                      {anotacao.updated_at !== anotacao.created_at && (
                        <span className="ml-2 text-orange-600">
                          (editado em {new Date(anotacao.updated_at).toLocaleString("pt-BR")})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(anotacao)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(anotacao.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{anotacao.conteudo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

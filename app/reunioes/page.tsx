"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, isSupabaseConfigured, mockMunicipios, type Reuniao, type Municipio } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { SupabaseStatus } from "@/components/supabase-status"

export default function Reunioes() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReuniao, setEditingReuniao] = useState<Reuniao | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_reuniao: "",
    municipio_id: "",
    secretario_nome: "",
    secretario_email: "",
    secretario_telefone: "",
    status: "agendada",
    observacoes: "",
  })

  useEffect(() => {
    fetchReunioes()
    fetchMunicipios()
  }, [])

  const fetchReunioes = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Usar dados mock do localStorage
        const storedReunioes = localStorage.getItem("reunioes")
        const reunioes = storedReunioes ? JSON.parse(storedReunioes) : []
        setReunioes(reunioes)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("reunioes")
        .select(`
        *,
        municipios (
          id,
          nome,
          estado
        )
      `)
        .order("data_reuniao", { ascending: true })

      if (error) throw error
      setReunioes(data || [])
    } catch (error) {
      console.error("Erro ao carregar reuniões:", error)
      toast({
        title: "Aviso",
        description: "Usando dados locais. Configure o Supabase para persistência real.",
        variant: "default",
      })
      // Fallback para dados locais
      const storedReunioes = localStorage.getItem("reunioes")
      const reunioes = storedReunioes ? JSON.parse(storedReunioes) : []
      setReunioes(reunioes)
    } finally {
      setLoading(false)
    }
  }

  const fetchMunicipios = async () => {
    try {
      if (!isSupabaseConfigured) {
        setMunicipios(mockMunicipios)
        return
      }

      const { data, error } = await supabase.from("municipios").select("*").order("nome")

      if (error) throw error
      setMunicipios(data || [])
    } catch (error) {
      console.error("Erro ao carregar municípios:", error)
      // Fallback para dados mock
      setMunicipios(mockMunicipios)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const reuniaoData = {
        ...formData,
        municipio_id: Number.parseInt(formData.municipio_id),
        id: editingReuniao?.id || Date.now(), // ID temporário para dados locais
      }

      if (!isSupabaseConfigured) {
        // Usar localStorage
        const storedReunioes = localStorage.getItem("reunioes")
        let reunioes = storedReunioes ? JSON.parse(storedReunioes) : []

        if (editingReuniao) {
          reunioes = reunioes.map((r: any) => (r.id === editingReuniao.id ? reuniaoData : r))
        } else {
          reuniaoData.created_at = new Date().toISOString()
          // Adicionar dados do município
          const municipio = municipios.find((m) => m.id === reuniaoData.municipio_id)
          reuniaoData.municipios = municipio
          reunioes.push(reuniaoData)
        }

        localStorage.setItem("reunioes", JSON.stringify(reunioes))

        toast({
          title: "Sucesso",
          description: editingReuniao ? "Reunião atualizada com sucesso!" : "Reunião agendada com sucesso!",
        })

        resetForm()
        setIsDialogOpen(false)
        fetchReunioes()
        return
      }

      // Código original do Supabase...
      if (editingReuniao) {
        const { error } = await supabase
          .from("reunioes")
          .update({
            ...formData,
            municipio_id: Number.parseInt(formData.municipio_id),
          })
          .eq("id", editingReuniao.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Reunião atualizada com sucesso!",
        })
      } else {
        const { error } = await supabase.from("reunioes").insert([
          {
            ...formData,
            municipio_id: Number.parseInt(formData.municipio_id),
          },
        ])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Reunião agendada com sucesso!",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      fetchReunioes()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar reunião",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (reuniao: Reuniao) => {
    setEditingReuniao(reuniao)
    setFormData({
      titulo: reuniao.titulo,
      descricao: reuniao.descricao || "",
      data_reuniao: new Date(reuniao.data_reuniao).toISOString().slice(0, 16),
      municipio_id: reuniao.municipio_id.toString(),
      secretario_nome: reuniao.secretario_nome,
      secretario_email: reuniao.secretario_email || "",
      secretario_telefone: reuniao.secretario_telefone || "",
      status: reuniao.status,
      observacoes: reuniao.observacoes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return

    try {
      if (!isSupabaseConfigured) {
        // Usar localStorage
        const storedReunioes = localStorage.getItem("reunioes")
        let reunioes = storedReunioes ? JSON.parse(storedReunioes) : []
        reunioes = reunioes.filter((r: any) => r.id !== id)
        localStorage.setItem("reunioes", JSON.stringify(reunioes))

        toast({
          title: "Sucesso",
          description: "Reunião excluída com sucesso!",
        })

        fetchReunioes()
        return
      }

      const { error } = await supabase.from("reunioes").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Reunião excluída com sucesso!",
      })

      fetchReunioes()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir reunião",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      data_reuniao: "",
      municipio_id: "",
      secretario_nome: "",
      secretario_email: "",
      secretario_telefone: "",
      status: "agendada",
      observacoes: "",
    })
    setEditingReuniao(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-blue-100 text-blue-800"
      case "realizada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      case "adiada":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando reuniões...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                Reuniões
              </h1>
              <p className="text-gray-600">Gerencie reuniões com secretários municipais</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Reunião
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingReuniao ? "Editar Reunião" : "Nova Reunião"}</DialogTitle>
                <DialogDescription>Preencha os dados da reunião com o secretário municipal</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="titulo">Título da Reunião *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_reuniao">Data e Hora *</Label>
                    <Input
                      id="data_reuniao"
                      type="datetime-local"
                      value={formData.data_reuniao}
                      onChange={(e) => setFormData({ ...formData, data_reuniao: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="municipio_id">Município *</Label>
                    <Select
                      value={formData.municipio_id}
                      onValueChange={(value) => setFormData({ ...formData, municipio_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o município" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipios.map((municipio) => (
                          <SelectItem key={municipio.id} value={municipio.id.toString()}>
                            {municipio.nome} - {municipio.estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="secretario_nome">Nome do Secretário *</Label>
                    <Input
                      id="secretario_nome"
                      value={formData.secretario_nome}
                      onChange={(e) => setFormData({ ...formData, secretario_nome: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="secretario_email">Email do Secretário</Label>
                    <Input
                      id="secretario_email"
                      type="email"
                      value={formData.secretario_email}
                      onChange={(e) => setFormData({ ...formData, secretario_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="secretario_telefone">Telefone do Secretário</Label>
                    <Input
                      id="secretario_telefone"
                      value={formData.secretario_telefone}
                      onChange={(e) => setFormData({ ...formData, secretario_telefone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendada">Agendada</SelectItem>
                        <SelectItem value="realizada">Realizada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                        <SelectItem value="adiada">Adiada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingReuniao ? "Atualizar" : "Agendar"} Reunião</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <SupabaseStatus />

        <div className="grid gap-6">
          {reunioes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reunião agendada</h3>
                <p className="text-gray-600 mb-4">Comece agendando sua primeira reunião com um secretário municipal.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Primeira Reunião
                </Button>
              </CardContent>
            </Card>
          ) : (
            reunioes.map((reuniao) => (
              <Card key={reuniao.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{reuniao.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(reuniao.data_reuniao).toLocaleString("pt-BR")} • {reuniao.municipios?.nome} -{" "}
                        {reuniao.municipios?.estado}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(reuniao.status)}>
                        {reuniao.status.charAt(0).toUpperCase() + reuniao.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(reuniao)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(reuniao.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Secretário Municipal</h4>
                      <p className="text-gray-600">{reuniao.secretario_nome}</p>
                      {reuniao.secretario_email && <p className="text-sm text-gray-500">{reuniao.secretario_email}</p>}
                      {reuniao.secretario_telefone && (
                        <p className="text-sm text-gray-500">{reuniao.secretario_telefone}</p>
                      )}
                    </div>
                    <div>
                      {reuniao.descricao && (
                        <>
                          <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                          <p className="text-gray-600 text-sm">{reuniao.descricao}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {reuniao.observacoes && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                      <p className="text-gray-600 text-sm">{reuniao.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

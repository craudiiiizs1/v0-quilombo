"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BookOpen, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, type Formador, type Municipio } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function Formadores() {
  const [formadores, setFormadores] = useState<Formador[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFormador, setEditingFormador] = useState<Formador | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    municipio_id: "",
    especialidade: "",
    formacao: "",
    certificacoes: "",
  })

  useEffect(() => {
    fetchFormadores()
    fetchMunicipios()
  }, [])

  const fetchFormadores = async () => {
    try {
      const { data, error } = await supabase
        .from("formadores")
        .select(`
          *,
          municipios (
            id,
            nome,
            estado
          )
        `)
        .order("nome")

      if (error) throw error
      setFormadores(data || [])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar formadores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMunicipios = async () => {
    try {
      const { data, error } = await supabase.from("municipios").select("*").order("nome")

      if (error) throw error
      setMunicipios(data || [])
    } catch (error) {
      console.error("Erro ao carregar municípios:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formadorData = {
        ...formData,
        municipio_id: Number.parseInt(formData.municipio_id),
      }

      if (editingFormador) {
        const { error } = await supabase.from("formadores").update(formadorData).eq("id", editingFormador.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Formador atualizado com sucesso!",
        })
      } else {
        const { error } = await supabase.from("formadores").insert([formadorData])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Formador cadastrado com sucesso!",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      fetchFormadores()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar formador",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (formador: Formador) => {
    setEditingFormador(formador)
    setFormData({
      nome: formador.nome,
      email: formador.email,
      telefone: formador.telefone || "",
      municipio_id: formador.municipio_id.toString(),
      especialidade: formador.especialidade || "",
      formacao: formador.formacao || "",
      certificacoes: formador.certificacoes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este formador?")) return

    try {
      const { error } = await supabase.from("formadores").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Formador excluído com sucesso!",
      })

      fetchFormadores()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir formador",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      municipio_id: "",
      especialidade: "",
      formacao: "",
      certificacoes: "",
    })
    setEditingFormador(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando formadores...</p>
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
                <BookOpen className="h-8 w-8 text-red-600" />
                Formadores
              </h1>
              <p className="text-gray-600">Gerencie o cadastro de formadores</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Formador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFormador ? "Editar Formador" : "Novo Formador"}</DialogTitle>
                <DialogDescription>Preencha os dados do formador</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
                    <Label htmlFor="especialidade">Especialidade</Label>
                    <Input
                      id="especialidade"
                      value={formData.especialidade}
                      onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                      placeholder="Ex: Alfabetização, Matemática"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formacao">Formação</Label>
                    <Input
                      id="formacao"
                      value={formData.formacao}
                      onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                      placeholder="Ex: Mestrado em Educação"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="certificacoes">Certificações</Label>
                    <Textarea
                      id="certificacoes"
                      value={formData.certificacoes}
                      onChange={(e) => setFormData({ ...formData, certificacoes: e.target.value })}
                      placeholder="Liste as certificações e cursos relevantes"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingFormador ? "Atualizar" : "Cadastrar"} Formador</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {formadores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum formador cadastrado</h3>
                <p className="text-gray-600 mb-4">Comece cadastrando o primeiro formador.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Formador
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formadores.map((formador) => (
                <Card key={formador.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{formador.nome}</CardTitle>
                        <CardDescription>
                          {formador.municipios?.nome} - {formador.municipios?.estado}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(formador)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(formador.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Email:</strong> {formador.email}
                      </p>
                      {formador.telefone && (
                        <p>
                          <strong>Telefone:</strong> {formador.telefone}
                        </p>
                      )}
                      {formador.especialidade && (
                        <p>
                          <strong>Especialidade:</strong> {formador.especialidade}
                        </p>
                      )}
                      {formador.formacao && (
                        <p>
                          <strong>Formação:</strong> {formador.formacao}
                        </p>
                      )}
                      {formador.certificacoes && (
                        <div>
                          <strong>Certificações:</strong>
                          <p className="text-xs text-gray-600 mt-1">{formador.certificacoes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { UserCheck, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, type Supervisor, type Municipio } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { AnotacoesGenericas } from "@/components/anotacoes-genericas"

export default function Supervisores() {
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    municipio_id: "",
    area_supervisao: "",
    formacao: "",
  })

  useEffect(() => {
    fetchSupervisores()
    fetchMunicipios()
  }, [])

  const fetchSupervisores = async () => {
    try {
      const { data, error } = await supabase
        .from("supervisores")
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
      setSupervisores(data || [])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar supervisores",
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
      const supervisorData = {
        ...formData,
        municipio_id: Number.parseInt(formData.municipio_id),
      }

      if (editingSupervisor) {
        const { error } = await supabase.from("supervisores").update(supervisorData).eq("id", editingSupervisor.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Supervisor atualizado com sucesso!",
        })
      } else {
        const { error } = await supabase.from("supervisores").insert([supervisorData])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Supervisor cadastrado com sucesso!",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      fetchSupervisores()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar supervisor",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor)
    setFormData({
      nome: supervisor.nome,
      email: supervisor.email,
      telefone: supervisor.telefone || "",
      municipio_id: supervisor.municipio_id.toString(),
      area_supervisao: supervisor.area_supervisao || "",
      formacao: supervisor.formacao || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este supervisor?")) return

    try {
      const { error } = await supabase.from("supervisores").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Supervisor excluído com sucesso!",
      })

      fetchSupervisores()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir supervisor",
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
      area_supervisao: "",
      formacao: "",
    })
    setEditingSupervisor(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Carregando supervisores...</p>
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
                <UserCheck className="h-8 w-8 text-purple-600" />
                Supervisores
              </h1>
              <p className="text-gray-600">Gerencie o cadastro de supervisores</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Supervisor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSupervisor ? "Editar Supervisor" : "Novo Supervisor"}</DialogTitle>
                <DialogDescription>Preencha os dados do supervisor</DialogDescription>
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
                    <Label htmlFor="area_supervisao">Área de Supervisão</Label>
                    <Input
                      id="area_supervisao"
                      value={formData.area_supervisao}
                      onChange={(e) => setFormData({ ...formData, area_supervisao: e.target.value })}
                      placeholder="Ex: Ensino Fundamental, Educação Infantil"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formacao">Formação</Label>
                    <Input
                      id="formacao"
                      value={formData.formacao}
                      onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                      placeholder="Ex: Pedagogia, Gestão Educacional"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingSupervisor ? "Atualizar" : "Cadastrar"} Supervisor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {supervisores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum supervisor cadastrado</h3>
                <p className="text-gray-600 mb-4">Comece cadastrando o primeiro supervisor.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Supervisor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supervisores.map((supervisor) => (
                <Card key={supervisor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{supervisor.nome}</CardTitle>
                        <CardDescription>
                          {supervisor.municipios?.nome} - {supervisor.municipios?.estado}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(supervisor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(supervisor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Email:</strong> {supervisor.email}
                      </p>
                      {supervisor.telefone && (
                        <p>
                          <strong>Telefone:</strong> {supervisor.telefone}
                        </p>
                      )}
                      {supervisor.area_supervisao && (
                        <p>
                          <strong>Área:</strong> {supervisor.area_supervisao}
                        </p>
                      )}
                      {supervisor.formacao && (
                        <p>
                          <strong>Formação:</strong> {supervisor.formacao}
                        </p>
                      )}
                    </div>
                    {/* Seção de Anotações */}
                    <div className="mt-4 pt-4 border-t">
                      <AnotacoesGenericas
                        entityId={supervisor.id}
                        entityType="supervisores"
                        entityName={supervisor.nome}
                      />
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

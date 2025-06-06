"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { UserPlus, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
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
import { supabase, isSupabaseConfigured, mockMunicipios, type Tutor, type Municipio } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { SupabaseStatus } from "@/components/supabase-status"

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    municipio_id: "",
    area_atuacao: "",
    formacao: "",
    experiencia_anos: "",
  })

  useEffect(() => {
    fetchTutores()
    fetchMunicipios()
  }, [])

  const fetchTutores = async () => {
    try {
      if (!isSupabaseConfigured) {
        const storedTutores = localStorage.getItem("tutores")
        const tutores = storedTutores ? JSON.parse(storedTutores) : []
        setTutores(tutores)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("tutores")
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
      setTutores(data || [])
    } catch (error) {
      console.error("Erro ao carregar tutores:", error)
      toast({
        title: "Aviso",
        description: "Usando dados locais. Configure o Supabase para persistência real.",
        variant: "default",
      })
      const storedTutores = localStorage.getItem("tutores")
      const tutores = storedTutores ? JSON.parse(storedTutores) : []
      setTutores(tutores)
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
      setMunicipios(mockMunicipios)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const tutorData = {
        ...formData,
        municipio_id: Number.parseInt(formData.municipio_id),
        experiencia_anos: formData.experiencia_anos ? Number.parseInt(formData.experiencia_anos) : null,
      }

      if (!isSupabaseConfigured) {
        const storedTutores = localStorage.getItem("tutores")
        let tutores = storedTutores ? JSON.parse(storedTutores) : []

        if (editingTutor) {
          tutores = tutores.map((t) => (t.id === editingTutor.id ? { ...tutorData, id: editingTutor.id } : t))
          localStorage.setItem("tutores", JSON.stringify(tutores))
          toast({
            title: "Sucesso",
            description: "Tutor atualizado com sucesso!",
          })
        } else {
          const newTutor = { ...tutorData, id: Date.now() }
          tutores = [...tutores, newTutor]
          localStorage.setItem("tutores", JSON.stringify(tutores))
          toast({
            title: "Sucesso",
            description: "Tutor cadastrado com sucesso!",
          })
        }
        setTutores(tutores)
      } else {
        if (editingTutor) {
          const { error } = await supabase.from("tutores").update(tutorData).eq("id", editingTutor.id)

          if (error) throw error

          toast({
            title: "Sucesso",
            description: "Tutor atualizado com sucesso!",
          })
        } else {
          const { error } = await supabase.from("tutores").insert([tutorData])

          if (error) throw error

          toast({
            title: "Sucesso",
            description: "Tutor cadastrado com sucesso!",
          })
        }
      }

      resetForm()
      setIsDialogOpen(false)
      fetchTutores()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar tutor",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (tutor: Tutor) => {
    setEditingTutor(tutor)
    setFormData({
      nome: tutor.nome,
      email: tutor.email,
      telefone: tutor.telefone || "",
      municipio_id: tutor.municipio_id.toString(),
      area_atuacao: tutor.area_atuacao || "",
      formacao: tutor.formacao || "",
      experiencia_anos: tutor.experiencia_anos?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este tutor?")) return

    try {
      if (!isSupabaseConfigured) {
        const storedTutores = localStorage.getItem("tutores")
        let tutores = storedTutores ? JSON.parse(storedTutores) : []
        tutores = tutores.filter((t) => t.id !== id)
        localStorage.setItem("tutores", JSON.stringify(tutores))
        setTutores(tutores)
        toast({
          title: "Sucesso",
          description: "Tutor excluído com sucesso!",
        })
      } else {
        const { error } = await supabase.from("tutores").delete().eq("id", id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Tutor excluído com sucesso!",
        })
      }

      fetchTutores()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir tutor",
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
      area_atuacao: "",
      formacao: "",
      experiencia_anos: "",
    })
    setEditingTutor(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Carregando tutores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SupabaseStatus />
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
                <UserPlus className="h-8 w-8 text-green-600" />
                Tutores
              </h1>
              <p className="text-gray-600">Gerencie o cadastro de tutores</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTutor ? "Editar Tutor" : "Novo Tutor"}</DialogTitle>
                <DialogDescription>Preencha os dados do tutor</DialogDescription>
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
                    <Label htmlFor="area_atuacao">Área de Atuação</Label>
                    <Input
                      id="area_atuacao"
                      value={formData.area_atuacao}
                      onChange={(e) => setFormData({ ...formData, area_atuacao: e.target.value })}
                      placeholder="Ex: Matemática, Português, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="formacao">Formação</Label>
                    <Input
                      id="formacao"
                      value={formData.formacao}
                      onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                      placeholder="Ex: Licenciatura em Matemática"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="experiencia_anos">Anos de Experiência</Label>
                    <Input
                      id="experiencia_anos"
                      type="number"
                      min="0"
                      value={formData.experiencia_anos}
                      onChange={(e) => setFormData({ ...formData, experiencia_anos: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingTutor ? "Atualizar" : "Cadastrar"} Tutor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {tutores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum tutor cadastrado</h3>
                <p className="text-gray-600 mb-4">Comece cadastrando o primeiro tutor.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Tutor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutores.map((tutor) => (
                <Card key={tutor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tutor.nome}</CardTitle>
                        <CardDescription>
                          {tutor.municipios?.nome} - {tutor.municipios?.estado}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(tutor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(tutor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Email:</strong> {tutor.email}
                      </p>
                      {tutor.telefone && (
                        <p>
                          <strong>Telefone:</strong> {tutor.telefone}
                        </p>
                      )}
                      {tutor.area_atuacao && (
                        <p>
                          <strong>Área:</strong> {tutor.area_atuacao}
                        </p>
                      )}
                      {tutor.formacao && (
                        <p>
                          <strong>Formação:</strong> {tutor.formacao}
                        </p>
                      )}
                      {tutor.experiencia_anos && (
                        <p>
                          <strong>Experiência:</strong> {tutor.experiencia_anos} anos
                        </p>
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

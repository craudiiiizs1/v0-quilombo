"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { GraduationCap, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
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
import { supabase, type Cursista, type Municipio } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { AnotacoesGenericas } from "@/components/anotacoes-genericas"

export default function Cursistas() {
  const [cursistas, setCursistas] = useState<Cursista[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCursista, setEditingCursista] = useState<Cursista | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    municipio_id: "",
    escola: "",
    cargo: "",
    curso_interesse: "",
  })

  useEffect(() => {
    fetchCursistas()
    fetchMunicipios()
  }, [])

  const fetchCursistas = async () => {
    try {
      const { data, error } = await supabase
        .from("cursistas")
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
      setCursistas(data || [])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar cursistas",
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
      const cursistaData = {
        ...formData,
        municipio_id: Number.parseInt(formData.municipio_id),
      }

      if (editingCursista) {
        const { error } = await supabase.from("cursistas").update(cursistaData).eq("id", editingCursista.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Cursista atualizado com sucesso!",
        })
      } else {
        const { error } = await supabase.from("cursistas").insert([cursistaData])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Cursista cadastrado com sucesso!",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      fetchCursistas()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar cursista",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (cursista: Cursista) => {
    setEditingCursista(cursista)
    setFormData({
      nome: cursista.nome,
      email: cursista.email,
      telefone: cursista.telefone || "",
      municipio_id: cursista.municipio_id.toString(),
      escola: cursista.escola || "",
      cargo: cursista.cargo || "",
      curso_interesse: cursista.curso_interesse || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cursista?")) return

    try {
      const { error } = await supabase.from("cursistas").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Cursista excluído com sucesso!",
      })

      fetchCursistas()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cursista",
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
      escola: "",
      cargo: "",
      curso_interesse: "",
    })
    setEditingCursista(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Carregando cursistas...</p>
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
                <GraduationCap className="h-8 w-8 text-orange-600" />
                Cursistas
              </h1>
              <p className="text-gray-600">Gerencie o cadastro de cursistas</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cursista
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCursista ? "Editar Cursista" : "Novo Cursista"}</DialogTitle>
                <DialogDescription>Preencha os dados do cursista</DialogDescription>
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
                    <Label htmlFor="escola">Escola</Label>
                    <Input
                      id="escola"
                      value={formData.escola}
                      onChange={(e) => setFormData({ ...formData, escola: e.target.value })}
                      placeholder="Nome da escola onde trabalha"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      placeholder="Ex: Professor, Coordenador"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="curso_interesse">Curso de Interesse</Label>
                    <Input
                      id="curso_interesse"
                      value={formData.curso_interesse}
                      onChange={(e) => setFormData({ ...formData, curso_interesse: e.target.value })}
                      placeholder="Curso ou programa de interesse"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingCursista ? "Atualizar" : "Cadastrar"} Cursista</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {cursistas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cursista cadastrado</h3>
                <p className="text-gray-600 mb-4">Comece cadastrando o primeiro cursista.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cursista
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursistas.map((cursista) => (
                <Card key={cursista.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{cursista.nome}</CardTitle>
                        <CardDescription>
                          {cursista.municipios?.nome} - {cursista.municipios?.estado}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(cursista)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(cursista.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Email:</strong> {cursista.email}
                      </p>
                      {cursista.telefone && (
                        <p>
                          <strong>Telefone:</strong> {cursista.telefone}
                        </p>
                      )}
                      {cursista.escola && (
                        <p>
                          <strong>Escola:</strong> {cursista.escola}
                        </p>
                      )}
                      {cursista.cargo && (
                        <p>
                          <strong>Cargo:</strong> {cursista.cargo}
                        </p>
                      )}
                      {cursista.curso_interesse && (
                        <p>
                          <strong>Interesse:</strong> {cursista.curso_interesse}
                        </p>
                      )}
                    </div>
                    {/* Seção de Anotações */}
                    <div className="mt-4 pt-4 border-t">
                      <AnotacoesGenericas entityId={cursista.id} entityType="cursistas" entityName={cursista.nome} />
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

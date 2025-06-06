"use client"

import { useState, useEffect } from "react"
import { FileText, Download, ArrowLeft, Calendar, UserPlus, UserCheck, GraduationCap, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function Relatorios() {
  const [loading, setLoading] = useState(false)
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("todos")
  const [municipios, setMunicipios] = useState<any[]>([])
  const [stats, setStats] = useState({
    reunioes: 0,
    tutores: 0,
    supervisores: 0,
    cursistas: 0,
    formadores: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchMunicipios()
    fetchStats()
  }, [selectedMunicipio])

  const fetchMunicipios = async () => {
    try {
      const { data, error } = await supabase.from("municipios").select("*").order("nome")

      if (error) throw error
      setMunicipios(data || [])
    } catch (error) {
      console.error("Erro ao carregar municípios:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const municipioFilter = selectedMunicipio !== "todos" ? { municipio_id: Number.parseInt(selectedMunicipio) } : {}

      const [reunioesRes, tutoresRes, supervisoresRes, cursistasRes, formadoresRes] = await Promise.all([
        supabase.from("reunioes").select("id", { count: "exact" }).match(municipioFilter),
        supabase.from("tutores").select("id", { count: "exact" }).match(municipioFilter),
        supabase.from("supervisores").select("id", { count: "exact" }).match(municipioFilter),
        supabase.from("cursistas").select("id", { count: "exact" }).match(municipioFilter),
        supabase.from("formadores").select("id", { count: "exact" }).match(municipioFilter),
      ])

      setStats({
        reunioes: reunioesRes.count || 0,
        tutores: tutoresRes.count || 0,
        supervisores: supervisoresRes.count || 0,
        cursistas: cursistasRes.count || 0,
        formadores: formadoresRes.count || 0,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const generateCSV = async (table: string, filename: string) => {
    setLoading(true)
    try {
      const municipioFilter = selectedMunicipio !== "todos" ? { municipio_id: Number.parseInt(selectedMunicipio) } : {}

      const { data, error } = await supabase
        .from(table)
        .select(`
          *,
          municipios (
            nome,
            estado
          )
        `)
        .match(municipioFilter)

      if (error) throw error

      if (!data || data.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há dados para exportar",
          variant: "destructive",
        })
        return
      }

      // Converter dados para CSV
      const headers = Object.keys(data[0]).filter((key) => key !== "municipios")
      headers.push("municipio", "estado")

      const csvContent = [
        headers.join(","),
        ...data.map((row) => {
          const values = headers.map((header) => {
            if (header === "municipio") return row.municipios?.nome || ""
            if (header === "estado") return row.municipios?.estado || ""
            const value = row[header]
            return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          })
          return values.join(",")
        }),
      ].join("\n")

      // Download do arquivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Sucesso",
        description: "Relatório baixado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateJSON = async (table: string, filename: string) => {
    setLoading(true)
    try {
      const municipioFilter = selectedMunicipio !== "todos" ? { municipio_id: Number.parseInt(selectedMunicipio) } : {}

      const { data, error } = await supabase
        .from(table)
        .select(`
          *,
          municipios (
            nome,
            estado
          )
        `)
        .match(municipioFilter)

      if (error) throw error

      if (!data || data.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há dados para exportar",
          variant: "destructive",
        })
        return
      }

      // Download do arquivo JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Sucesso",
        description: "Relatório baixado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const reportCards = [
    {
      title: "Reuniões",
      description: "Relatório de reuniões agendadas",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      count: stats.reunioes,
      table: "reunioes",
      filename: "relatorio-reunioes",
    },
    {
      title: "Tutores",
      description: "Relatório de tutores cadastrados",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      count: stats.tutores,
      table: "tutores",
      filename: "relatorio-tutores",
    },
    {
      title: "Supervisores",
      description: "Relatório de supervisores cadastrados",
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      count: stats.supervisores,
      table: "supervisores",
      filename: "relatorio-supervisores",
    },
    {
      title: "Cursistas",
      description: "Relatório de cursistas cadastrados",
      icon: GraduationCap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      count: stats.cursistas,
      table: "cursistas",
      filename: "relatorio-cursistas",
    },
    {
      title: "Formadores",
      description: "Relatório de formadores cadastrados",
      icon: BookOpen,
      color: "text-red-600",
      bgColor: "bg-red-50",
      count: stats.formadores,
      table: "formadores",
      filename: "relatorio-formadores",
    },
  ]

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
                <FileText className="h-8 w-8 text-indigo-600" />
                Relatórios
              </h1>
              <p className="text-gray-600">Gere e baixe relatórios do sistema</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Selecione os filtros para os relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="municipio">Município</Label>
                  <Select value={selectedMunicipio} onValueChange={setSelectedMunicipio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o município" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Municípios</SelectItem>
                      {municipios.map((municipio) => (
                        <SelectItem key={municipio.id} value={municipio.id.toString()}>
                          {municipio.nome} - {municipio.estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportCards.map((report) => {
            const Icon = report.icon
            return (
              <Card key={report.table}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{report.count}</div>
                      <div className="text-sm text-gray-500">registros</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateCSV(report.table, `${report.filename}.csv`)}
                      disabled={loading || report.count === 0}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateJSON(report.table, `${report.filename}.json`)}
                      disabled={loading || report.count === 0}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
            <CardDescription>
              Visão geral dos dados do sistema
              {selectedMunicipio !== "todos" && (
                <span className="ml-2 text-blue-600">
                  (Filtrado por: {municipios.find((m) => m.id.toString() === selectedMunicipio)?.nome})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.reunioes}</div>
                <div className="text-sm text-gray-600">Reuniões</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.tutores}</div>
                <div className="text-sm text-gray-600">Tutores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.supervisores}</div>
                <div className="text-sm text-gray-600">Supervisores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.cursistas}</div>
                <div className="text-sm text-gray-600">Cursistas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.formadores}</div>
                <div className="text-sm text-gray-600">Formadores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

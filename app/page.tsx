import Link from "next/link"
import { Calendar, FileText, UserPlus, GraduationCap, BookOpen, UserCheck, FolderSyncIcon as Sync } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Gestão Educacional</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma completa para gerenciamento de projetos educacionais, agendamento de reuniões e cadastro de
            profissionais da educação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/reunioes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Reuniões
                </CardTitle>
                <CardDescription>Agendar e gerenciar reuniões com secretários municipais</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Organize reuniões, defina agendas e acompanhe o status dos encontros.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tutores">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Tutores
                </CardTitle>
                <CardDescription>Cadastro e gestão de tutores</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Registre tutores, suas especialidades e áreas de atuação.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/supervisores">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  Supervisores
                </CardTitle>
                <CardDescription>Cadastro e gestão de supervisores</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Gerencie supervisores e suas áreas de supervisão.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cursistas">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-orange-600" />
                  Cursistas
                </CardTitle>
                <CardDescription>Cadastro e gestão de cursistas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Registre cursistas interessados nos programas educacionais.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/formadores">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  Formadores
                </CardTitle>
                <CardDescription>Cadastro e gestão de formadores</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Gerencie formadores e suas especialidades.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/relatorios">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Relatórios
                </CardTitle>
                <CardDescription>Gerar e baixar relatórios</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Visualize dados e gere relatórios em diversos formatos.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/sincronizacao">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sync className="h-5 w-5 text-yellow-600" />
                  Sincronização
                </CardTitle>
                <CardDescription>Gerenciar sincronização de dados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Sincronize dados locais com o Supabase e resolva conflitos.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

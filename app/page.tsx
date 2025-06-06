import Link from "next/link"
import { Calendar, FileText, UserPlus, GraduationCap, BookOpen, UserCheck, FolderSyncIcon as Sync } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AfricanPattern } from "@/components/african-pattern"
import { AppHeader } from "@/components/app-header"

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-quilombo-orange/10 to-quilombo-turquoise/10">
        {/* Padrão africano no topo */}
        <AfricanPattern variant="top" />

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-quilombo-green mb-2">Gestão Administrativa do</h1>
              <h2 className="text-3xl md:text-4xl font-bold text-quilombo-orange mb-4">
                CURSO DE APERFEIÇOAMENTO ESCOLA QUILOMBO
              </h2>
            </div>
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-quilombo-orange/20">
              <p className="text-xl text-quilombo-green leading-relaxed">
                Plataforma de gestão educacional voltada para o fortalecimento da educação quilombola, promovendo a
                equidade étnico-racial e o desenvolvimento de práticas pedagógicas antirracistas nas comunidades
                quilombolas da Bahia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link href="/reunioes">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <Calendar className="h-6 w-6 text-quilombo-turquoise" />
                    Reuniões
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">
                    Agendar e gerenciar reuniões com secretários municipais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Organize reuniões, defina agendas e acompanhe o status dos encontros com as secretarias municipais.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tutores">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <UserPlus className="h-6 w-6 text-quilombo-green-light" />
                    Tutores
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">
                    Cadastro e gestão de tutores especializados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Registre tutores especializados em educação quilombola e suas áreas de atuação.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/supervisores">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                    Supervisores
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">
                    Cadastro e gestão de supervisores pedagógicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Gerencie supervisores pedagógicos e suas áreas de supervisão educacional.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cursistas">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-quilombo-orange/10 to-quilombo-orange/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <GraduationCap className="h-6 w-6 text-quilombo-orange" />
                    Cursistas
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">
                    Cadastro de educadores participantes do curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Registre educadores interessados no curso de aperfeiçoamento em educação quilombola.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/formadores">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-red-50 to-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <BookOpen className="h-6 w-6 text-red-600" />
                    Formadores
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">
                    Cadastro de formadores e pesquisadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Gerencie formadores, pesquisadores e especialistas em educação quilombola.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/relatorios">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-quilombo-turquoise/10 to-quilombo-turquoise/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <FileText className="h-6 w-6 text-quilombo-turquoise" />
                    Relatórios
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">
                    Gerar relatórios e análises de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Visualize dados do projeto e gere relatórios detalhados em diversos formatos.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sincronizacao">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-quilombo-orange/20 hover:border-quilombo-orange/50 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-quilombo-green">
                    <Sync className="h-6 w-6 text-quilombo-orange-light" />
                    Sincronização
                  </CardTitle>
                  <CardDescription className="text-quilombo-green/80">Gerenciar sincronização de dados</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quilombo-green/70">
                    Sincronize dados locais com o servidor e resolva conflitos de informações.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Padrão africano na parte inferior */}
        <AfricanPattern variant="bottom" />
      </div>
    </>
  )
}

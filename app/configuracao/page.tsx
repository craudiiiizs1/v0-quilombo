"use client"

import { useState } from "react"
import { ArrowLeft, Database, CheckCircle, XCircle, Copy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isSupabaseConfigured } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function Configuracao() {
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  const [supabaseKey, setSupabaseKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    })
  }

  const sqlScript = `-- Criar tabela de municípios
CREATE TABLE IF NOT EXISTS municipios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de reuniões
CREATE TABLE IF NOT EXISTS reunioes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_reuniao TIMESTAMP NOT NULL,
  municipio_id INTEGER REFERENCES municipios(id),
  secretario_nome VARCHAR(255) NOT NULL,
  secretario_email VARCHAR(255),
  secretario_telefone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'agendada',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de tutores
CREATE TABLE IF NOT EXISTS tutores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  area_atuacao VARCHAR(255),
  formacao VARCHAR(255),
  experiencia_anos INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de supervisores
CREATE TABLE IF NOT EXISTS supervisores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  area_supervisao VARCHAR(255),
  formacao VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de cursistas
CREATE TABLE IF NOT EXISTS cursistas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  escola VARCHAR(255),
  cargo VARCHAR(255),
  curso_interesse VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de formadores
CREATE TABLE IF NOT EXISTS formadores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  especialidade VARCHAR(255),
  formacao VARCHAR(255),
  certificacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir alguns municípios de exemplo
INSERT INTO municipios (nome, estado) VALUES
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG'),
('Salvador', 'BA'),
('Fortaleza', 'CE'),
('Brasília', 'DF'),
('Curitiba', 'PR'),
('Recife', 'PE'),
('Porto Alegre', 'RS'),
('Manaus', 'AM');`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              Configuração do Supabase
            </h1>
            <p className="text-gray-600">Configure a conexão com o banco de dados</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Status da Configuração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isSupabaseConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Status da Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSupabaseConfigured ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Supabase configurado corretamente! O sistema está usando o banco de dados real.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Supabase não configurado. O sistema está usando dados locais temporários.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Passo 1: Criar Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Passo 1: Criar Projeto no Supabase</CardTitle>
              <CardDescription>Crie uma conta e um novo projeto no Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Acesse{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    supabase.com
                  </a>
                </li>
                <li>Crie uma conta ou faça login</li>
                <li>Clique em "New Project"</li>
                <li>Escolha sua organização e configure o projeto</li>
                <li>Aguarde a criação do projeto (pode levar alguns minutos)</li>
              </ol>
            </CardContent>
          </Card>

          {/* Passo 2: Obter Credenciais */}
          <Card>
            <CardHeader>
              <CardTitle>Passo 2: Obter Credenciais</CardTitle>
              <CardDescription>Copie as credenciais do seu projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  No dashboard do Supabase, vá para <strong>Settings → API</strong>
                </li>
                <li>
                  Copie a <strong>Project URL</strong>
                </li>
                <li>
                  Copie a <strong>anon/public key</strong>
                </li>
              </ol>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="url">Project URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://seu-projeto.supabase.co"
                      readOnly={isSupabaseConfigured}
                    />
                    {supabaseUrl && (
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(supabaseUrl)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="key">Anon Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="key"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      readOnly={isSupabaseConfigured}
                      type="password"
                    />
                    {supabaseKey && (
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(supabaseKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passo 3: Configurar Variáveis de Ambiente */}
          <Card>
            <CardHeader>
              <CardTitle>Passo 3: Configurar Variáveis de Ambiente</CardTitle>
              <CardDescription>Adicione as credenciais ao seu projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Crie um arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code> na raiz do projeto com:
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-gray-800 border-gray-700 text-gray-300"
                  onClick={() =>
                    copyToClipboard(
                      `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "sua_url_do_projeto"}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey || "sua_chave_anonima"}`,
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="text-sm">
                  {`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "sua_url_do_projeto"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey || "sua_chave_anonima"}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Passo 4: Executar Scripts SQL */}
          <Card>
            <CardHeader>
              <CardTitle>Passo 4: Criar Tabelas</CardTitle>
              <CardDescription>Execute o script SQL para criar as tabelas necessárias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  No dashboard do Supabase, vá para <strong>SQL Editor</strong>
                </li>
                <li>Cole o script abaixo e execute</li>
              </ol>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative max-h-96 overflow-y-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-gray-800 border-gray-700 text-gray-300"
                  onClick={() => copyToClipboard(sqlScript)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="text-xs">{sqlScript}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Passo 5: Reiniciar Aplicação */}
          <Card>
            <CardHeader>
              <CardTitle>Passo 5: Reiniciar Aplicação</CardTitle>
              <CardDescription>Reinicie o servidor para aplicar as mudanças</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <code className="text-sm">npm run dev</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

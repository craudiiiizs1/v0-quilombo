import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Verificar se o Supabase está configurado
export const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Dados mock para quando o Supabase não estiver configurado
export const mockMunicipios = [
  { id: 1, nome: "São Paulo", estado: "SP", created_at: new Date().toISOString() },
  { id: 2, nome: "Rio de Janeiro", estado: "RJ", created_at: new Date().toISOString() },
  { id: 3, nome: "Belo Horizonte", estado: "MG", created_at: new Date().toISOString() },
  { id: 4, nome: "Salvador", estado: "BA", created_at: new Date().toISOString() },
  { id: 5, nome: "Fortaleza", estado: "CE", created_at: new Date().toISOString() },
]

// Tipos para as tabelas
export interface Municipio {
  id: number
  nome: string
  estado: string
  created_at: string
}

export interface Reuniao {
  id: number
  titulo: string
  descricao?: string
  data_reuniao: string
  municipio_id: number
  secretario_nome: string
  secretario_email?: string
  secretario_telefone?: string
  status: string
  observacoes?: string
  created_at: string
  municipios?: Municipio
}

export interface Tutor {
  id: number
  nome: string
  email: string
  telefone?: string
  municipio_id: number
  area_atuacao?: string
  formacao?: string
  experiencia_anos?: number
  created_at: string
  municipios?: Municipio
}

export interface Supervisor {
  id: number
  nome: string
  email: string
  telefone?: string
  municipio_id: number
  area_supervisao?: string
  formacao?: string
  created_at: string
  municipios?: Municipio
}

export interface Cursista {
  id: number
  nome: string
  email: string
  telefone?: string
  municipio_id: number
  escola?: string
  cargo?: string
  curso_interesse?: string
  created_at: string
  municipios?: Municipio
}

export interface Formador {
  id: number
  nome: string
  email: string
  telefone?: string
  municipio_id: number
  especialidade?: string
  formacao?: string
  certificacoes?: string
  created_at: string
  municipios?: Municipio
}

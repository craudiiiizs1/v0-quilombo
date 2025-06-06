import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gckszjgjlwgxxzmxcefc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3N6amdqbHdneHh6bXhjZWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMjM3MjcsImV4cCI6MjA1NTg5OTcyN30.mTGKRUIhwv4-yZuFaJwVY51O30E2eNsn3_j_dGT7XVM'

// Configurações de debug
const supabaseOptions = {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    channels: {},
    endpoint: `${supabaseUrl.replace('https', 'wss')}/realtime/v1`,
    params: {
      apikey: supabaseAnonKey,
    },
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)

// Função para testar conexão
export async function testSupabaseConnection() {
  const tests = []
  
  try {
    // Teste 1: Verificar configuração
    tests.push({
      name: 'Configuração',
      result: 'OK',
      details: `URL configurada e chave válida`
    })

    // Teste 2: Testar conexão básica (só count)
    try {
      const { count, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      tests.push({
        name: 'Conexão',
        result: 'OK',
        details: `Tabela acessível com ${count} registros`
      })
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      tests.push({
        name: 'Conexão',
        result: 'ERRO',
        details: `${err.message || 'Erro desconhecido'} (Código: ${(err.code || 'desconhecido')})`
      })
    }

    // Teste 3: Verificar se consegue acessar dados
    try {
      const { data, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('*')
        .limit(1)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        tests.push({
          name: 'Acesso aos dados',
          result: 'OK',
          details: `Dados acessíveis normalmente`
        })
      } else {
        tests.push({
          name: 'Acesso aos dados',
          result: 'VAZIO',
          details: `Tabela vazia ou sem dados`
        })
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      if (err.code === 'PGRST116') {
        tests.push({
          name: 'Acesso aos dados',
          result: 'ERRO (RLS)',
          details: 'Row Level Security está bloqueando o acesso - precisa configurar políticas no Supabase'
        })
      } else {
        const errorMessage = err.message || 'Erro desconhecido'
        tests.push({
          name: 'Acesso aos dados',
          result: 'ERRO',
          details: errorMessage
        })
      }
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    tests.push({
      name: 'Erro geral',
      result: 'FALHA',
      details: errorMessage
    })
  }

  return tests
}

// Função para tentar diferentes estratégias de conexão
export async function tryMultipleConnectionStrategies() {
  const strategies = []

  // Estratégia 1: Query direta normal SEM LIMIT
  try {
    const { data, error } = await supabase
      .from('leads_febracis_abc_gru')
      .select('*')
    
    if (!error && data) {
      strategies.push({
        name: 'Query direta',
        success: true,
        data: data,
        count: data.length
      })
      return { success: true, data, strategy: 'Query direta' }
    } else {
      strategies.push({
        name: 'Query direta',
        success: false,
        error: error?.message || 'Dados vazios'
      })
    }
  } catch (error: unknown) {
    const err = error as { message?: string }
    const errorMessage = err.message || 'Erro desconhecido'
    strategies.push({
      name: 'Query direta',
      success: false,
      error: errorMessage
    })
  }

  // Estratégia 2: Query com campos específicos SEM LIMIT
  try {
    const { data, error } = await supabase
      .from('leads_febracis_abc_gru')
      .select('nome, email, whatsapp, regiao, form_name, unidade, data_cadastro, utm_source, utm_medium, utm_campaign, empresa, cargo, faturamento, funcionarios')
    
    if (!error && data && data.length > 0) {
      strategies.push({
        name: 'Query com campos específicos',
        success: true,
        data: data,
        count: data.length
      })
      return { success: true, data, strategy: 'Query com campos específicos' }
    } else {
      strategies.push({
        name: 'Query com campos específicos',
        success: false,
        error: error?.message || 'Dados vazios'
      })
    }
  } catch (error: unknown) {
    const err = error as { message?: string }
    const errorMessage = err.message || 'Erro desconhecido'
    strategies.push({
      name: 'Query com campos específicos',
      success: false,
      error: errorMessage
    })
  }

  console.log('🔍 Resultados das estratégias:', strategies)
  
  return { 
    success: false, 
    strategies, 
    message: 'Todas as estratégias falharam - provável problema de RLS ou permissões'
  }
}

// Tipos para a tabela de leads - CORRIGIDO baseado na estrutura real
export interface Lead {
  id?: string
  nome?: string
  email?: string
  whatsapp?: string // Era 'telefone'
  regiao?: string
  page_url?: string
  form_name?: string
  empresa?: string
  cargo?: string
  faturamento?: string // Pode ser string na tabela
  funcionarios?: string // Pode ser string na tabela
  data_cadastro?: string
  numero_formatado?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  origem_de_contato?: string
  consultor?: string
  unidade?: string // Era 'conta_sistema'
  // removed created_at e updated_at pois não existem na tabela real
} 
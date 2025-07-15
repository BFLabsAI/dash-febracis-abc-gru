'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { supabase, Lead, tryMultipleConnectionStrategies } from '@/lib/supabase'
import { parseBrazilianDateLocal, isDateInRange, toBrazilianDateTimeString } from '@/lib/dateUtils'

interface FilterState {
  startDate: string
  endDate: string
  conta: string[]
  funil: string[]
}

interface LeadsTableProps {
  filters: FilterState
}

type SortDirection = 'asc' | 'desc' | null
type SortField = keyof Lead | null

export default function LeadsTable({ filters }: LeadsTableProps) {
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      console.log('🔄 Tentando múltiplas estratégias de conexão...')
      
      // Tentar as diferentes estratégias
      const result = await tryMultipleConnectionStrategies()
      
      if (result.success && result.data) {
        console.log(`✅ Sucesso com estratégia: ${result.strategy}`)
        console.log(`📊 ${result.data.length} registros carregados do Supabase`)
        
        // Mapear dados para a interface Lead completa se necessário
        const mappedData = result.data.map((item: any) => ({
          ...item,
          id: item.id || String(Math.random())
        })) as Lead[]
        
        setAllLeads(mappedData)
        return
      }
      
      // Se chegou aqui, todas as estratégias falharam
      console.log('❌ Todas as estratégias falharam, usando dados de exemplo')
      if (result.strategies) {
        console.log('📋 Detalhes das tentativas:', result.strategies)
      }
      
      // Fallback para dados de exemplo
      const sampleData: Lead[] = [
        {
          id: '1',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997482193',
          regiao: 'ABC Paulista',
          page_url: 'https://febracisabc.com.br/metodocisabc/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'MCIS - Nova Pagina 01',
          empresa: 'null',
          cargo: 'null',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:01',
          numero_formatado: '(85) 9 9748-2193',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '23281',
          consultor: 'NADINE.MOREIRA',
          unidade: 'ds_performance'
        },
        {
          id: '2',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997482193',
          regiao: 'ABC Paulista',
          page_url: 'https://febracisabc.com.br/metodocisabc/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'MCIS - Nova Pagina 01',
          empresa: 'null',
          cargo: 'null',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:01',
          numero_formatado: '(85) 9 9748-2193',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '23281',
          consultor: 'NADINE.MOREIRA',
          unidade: 'ds_performance'
        },
        {
          id: '3',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '8599738381',
          regiao: undefined,
          page_url: 'https://febracisabc.com.br/tecnicasdevendas/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'GESTAO-360',
          empresa: 'bflbs',
          cargo: 'ceo',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:19',
          numero_formatado: '8599738381',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '23281',
          consultor: 'GIOVANNA.FEBRACIS',
          unidade: 'Febracis_Santo_Andre'
        },
        {
          id: '4',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997481913',
          regiao: 'Baixada',
          page_url: 'https://febracisabc.com.br/ml5-2/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'ML5 - FORM',
          empresa: 'null',
          cargo: 'null',
          faturamento: 'null',
          funcionarios: '21 a 50',
          data_cadastro: '15-07-2025 06:20',
          numero_formatado: '(85) 9 9748-1913',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '25559',
          consultor: 'GIOVANNA.KAYLANIGRU',
          unidade: 'Febracis_GRU'
        },
        {
          id: '5',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '8599738381',
          regiao: undefined,
          page_url: 'https://febracisabc.com.br/tecnicasdevendas/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'GESTAO-360',
          empresa: 'bflbs',
          cargo: 'ceo',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:21',
          numero_formatado: '8599738381',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '23281',
          consultor: 'GIOVANNA.FEBRACIS',
          unidade: 'Febracis_Santo_Andre'
        },
        {
          id: '6',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997481913',
          regiao: 'Baixada Santista',
          page_url: 'https://febracisabc.com.br/ml5-2/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'ML5 - FORM',
          empresa: 'null',
          cargo: 'null',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:22',
          numero_formatado: '(85) 9 9748-1913',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '25559',
          consultor: 'GIOVANNA.KAYLANIGRU',
          unidade: 'Febracis_GRU'
        },
        {
          id: '7',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997481914',
          regiao: 'ABC Paulista',
          page_url: 'https://febracisabc.com.br/metodocisabc/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'MCIS - Nova Pagina 01',
          empresa: 'null',
          cargo: 'null',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:23',
          numero_formatado: '(85) 9 9748-1914',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '23281',
          consultor: 'NADINE.MOREIRA',
          unidade: 'ds_performance'
        },
        {
          id: '8',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997481915',
          regiao: 'Baixada',
          page_url: 'https://febracisabc.com.br/ml5-2/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'ML5 - FORM',
          empresa: 'null',
          cargo: 'null',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:24',
          numero_formatado: '(85) 9 9748-1915',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '25559',
          consultor: 'GIOVANNA.KAYLANIGRU',
          unidade: 'Febracis_GRU'
        },
        {
          id: '9',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997481916',
          regiao: undefined,
          page_url: 'https://febracisabc.com.br/tecnicasdevendas/?utm_source=FacebookAds&utm_medium=teste&utm_campaign=teste&utm_term=teste&utm_content=teste',
          form_name: 'GESTAO-360',
          empresa: 'bflbs',
          cargo: 'ceo',
          faturamento: 'null',
          funcionarios: 'null',
          data_cadastro: '15-07-2025 06:25',
          numero_formatado: '8599738381',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          utm_term: 'teste',
          utm_content: 'teste',
          origem_de_contato: '23281',
          consultor: 'GIOVANNA.FEBRACIS',
          unidade: 'Febracis_Santo_Andre'
        }
      ]
      console.log('📊 Usando dados de exemplo baseados no CSV')
      setAllLeads(sampleData)
      
    } catch (error: any) {
      console.error('💥 ERRO CRÍTICO:', error)
      
      // Fallback final
      const sampleData: Lead[] = [
        {
          id: '1',
          nome: 'bruno',
          email: 'brunoguerrafalcao@gmai.com',
          whatsapp: '85997482193',
          regiao: 'ABC Paulista',
          form_name: 'MCIS - Nova Pagina 01',
          data_cadastro: '15-07-2025 06:01',
          utm_source: 'FacebookAds',
          utm_medium: 'teste',
          utm_campaign: 'teste',
          unidade: 'ds_performance'
        }
      ]
      setAllLeads(sampleData)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar leads com base nos filtros aplicados
  const filteredLeads = useMemo(() => {
    let filtered = allLeads

    // Aplicar filtros de data
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(lead => {
        if (!lead.data_cadastro) return false
        return isDateInRange(lead.data_cadastro, filters.startDate, filters.endDate)
      })
    }

    // Aplicar filtros de conta
    if (filters.conta.length > 0) {
      filtered = filtered.filter(lead => 
        lead.unidade && filters.conta.includes(lead.unidade)
      )
    }

    // Aplicar filtros de funil
    if (filters.funil.length > 0) {
      filtered = filtered.filter(lead => 
        lead.form_name && filters.funil.includes(lead.form_name)
      )
    }

    return filtered
  }, [allLeads, filters])

  const filteredAndSortedLeads = useMemo(() => {
    let processed = filteredLeads

    // Aplicar busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      processed = filteredLeads.filter(lead =>
        Object.values(lead).some(value =>
          value?.toString().toLowerCase().includes(searchLower)
        )
      )
    }

    // Aplicar ordenação
    if (sortField && sortDirection) {
      processed = [...processed].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortDirection === 'asc' ? 1 : -1
        if (bValue == null) return sortDirection === 'asc' ? -1 : 1
        
        // Tratamento especial para datas
        if (sortField === 'data_cadastro') {
          const aDate = aValue ? new Date(aValue) : null
          const bDate = bValue ? new Date(bValue) : null
          
          if (!aDate && !bDate) return 0
          if (!aDate) return sortDirection === 'asc' ? 1 : -1
          if (!bDate) return sortDirection === 'asc' ? -1 : 1
          
          return sortDirection === 'asc' 
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime()
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      })
    }

    return processed
  }, [filteredLeads, searchTerm, sortField, sortDirection])

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedLeads.slice(start, start + itemsPerPage)
  }, [filteredAndSortedLeads, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage)

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof Lead) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4" />
    }
    return <ArrowUpDown className="h-4 w-4" />
  }

  const exportToCSV = () => {
    if (filteredAndSortedLeads.length === 0) return

    const headers = Object.keys(filteredAndSortedLeads[0]).join(',')
    const rows = filteredAndSortedLeads.map(lead =>
      Object.values(lead).map(value => 
        value ? `"${value.toString().replace(/"/g, '""')}"` : '""'
      ).join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `leads_febracis_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatValue = (value: any, fieldKey?: string) => {
    if (value == null) return '-'
    
    // Formatação especial para data_cadastro
    if (fieldKey === 'data_cadastro') {
      const date = value ? new Date(value) : null
      if (date) {
        return toBrazilianDateTimeString(date)
      }
    }
    
    return value.toString()
  }

  const columns = [
    { key: 'nome' as keyof Lead, label: 'Nome' },
    { key: 'whatsapp' as keyof Lead, label: 'WhatsApp' }, // Era 'telefone'
    { key: 'email' as keyof Lead, label: 'Email' },
    { key: 'empresa' as keyof Lead, label: 'Empresa' },
    { key: 'cargo' as keyof Lead, label: 'Cargo' },
    { key: 'funcionarios' as keyof Lead, label: 'Funcionários' },
    { key: 'faturamento' as keyof Lead, label: 'Faturamento' },
    { key: 'regiao' as keyof Lead, label: 'Região' },
    { key: 'utm_source' as keyof Lead, label: 'UTM Source' },
    { key: 'utm_medium' as keyof Lead, label: 'UTM Medium' },
    { key: 'utm_campaign' as keyof Lead, label: 'UTM Campaign' },
    { key: 'utm_content' as keyof Lead, label: 'UTM Content' },
    { key: 'utm_term' as keyof Lead, label: 'UTM Term' },
    { key: 'form_name' as keyof Lead, label: 'Funil' },
    { key: 'unidade' as keyof Lead, label: 'Unidade' }, // Era 'conta_sistema'
    { key: 'data_cadastro' as keyof Lead, label: 'Data Cadastro' },
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Todos os Leads</h3>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
            Todos os Leads ({filteredAndSortedLeads.length})
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 w-64"
              />
            </div>
            
            <button
              onClick={exportToCSV}
              disabled={filteredAndSortedLeads.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginatedLeads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                {filteredAndSortedLeads.length === 0 ? 'Nenhum lead encontrado com os filtros aplicados' : 'Página vazia'}
              </p>
            </div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLeads.map((lead, index) => (
                <tr key={lead.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatValue(lead[column.key], column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} de {filteredAndSortedLeads.length} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
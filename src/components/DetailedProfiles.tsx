'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toBrazilianDateTimeString } from '@/lib/dateUtils'

interface QualitativeFilterState {
  startDate: string
  endDate: string
  conta: string[]
  utmSource: string[]
  utmMedium: string[]
  utmCampaign: string[]
  utmContent: string[]
  utmTerm: string[]
}

interface DetailedProfilesProps {
  filters: QualitativeFilterState
}

interface ProfileLead {
  id?: string
  nome?: string
  whatsapp?: string
  email?: string
  empresa?: string
  cargo?: string
  faturamento?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  form_name?: string
  unidade?: string
  data_cadastro?: string
}

type SortField = keyof ProfileLead | null
type SortDirection = 'asc' | 'desc' | null

export default function DetailedProfiles({ filters }: DetailedProfilesProps) {
  const [allLeads, setAllLeads] = useState<ProfileLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    try {
      const { data: leads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('*')

      if (error) throw error

      if (leads) {
        setAllLeads(leads)
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar leads com base nos filtros aplicados
  const filteredLeads = useMemo(() => {
    let filtered = allLeads

    // Aplicar filtros de período
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(lead => {
        if (!lead.data_cadastro) return false
        const date = new Date(lead.data_cadastro)
        const start = new Date(filters.startDate)
        const end = new Date(filters.endDate)
        return date >= start && date <= end
      })
    }

    // Aplicar filtros UTM e conta
    if (filters.conta.length > 0) {
      filtered = filtered.filter(lead => 
        lead.unidade && filters.conta.includes(lead.unidade)
      )
    }

    if (filters.utmSource.length > 0) {
      filtered = filtered.filter(lead => 
        lead.utm_source && filters.utmSource.includes(lead.utm_source)
      )
    }

    if (filters.utmMedium.length > 0) {
      filtered = filtered.filter(lead => 
        lead.utm_medium && filters.utmMedium.includes(lead.utm_medium)
      )
    }

    if (filters.utmCampaign.length > 0) {
      filtered = filtered.filter(lead => 
        lead.utm_campaign && filters.utmCampaign.includes(lead.utm_campaign)
      )
    }

    if (filters.utmContent.length > 0) {
      filtered = filtered.filter(lead => 
        lead.utm_content && filters.utmContent.includes(lead.utm_content)
      )
    }

    if (filters.utmTerm.length > 0) {
      filtered = filtered.filter(lead => 
        lead.utm_term && filters.utmTerm.includes(lead.utm_term)
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
        
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      })
    }

    return processed
  }, [filteredLeads, searchTerm, sortField, sortDirection])

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLeads = filteredAndSortedLeads.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />
    return <ArrowDown className="h-4 w-4" />
  }

  const exportToCSV = () => {
    const headers = [
      'Nome', 'Telefone', 'Email', 'Empresa', 'Cargo', 'Faturamento',
      'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
      'Funil', 'Unidade', 'Data Cadastro'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedLeads.map(lead => [
        lead.nome || '',
        lead.whatsapp || '',
        lead.email || '',
        lead.empresa || '',
        lead.cargo || '',
        lead.faturamento || '',
        lead.utm_source || '',
        lead.utm_medium || '',
        lead.utm_campaign || '',
        lead.utm_content || '',
        lead.utm_term || '',
        lead.form_name || '',
        lead.unidade || '',
        lead.data_cadastro ? toBrazilianDateTimeString(new Date(lead.data_cadastro)) : ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `perfis_detalhados_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatValue = (value: unknown, fieldKey?: string) => {
    if (value == null) return '-'
    
    if (fieldKey === 'data_cadastro') {
      const date = value ? new Date(value as string) : null
      if (date) {
        return toBrazilianDateTimeString(date)
      }
    }
    
    return value.toString()
  }

  const columns = [
    { key: 'nome' as keyof ProfileLead, label: 'Nome' },
    { key: 'whatsapp' as keyof ProfileLead, label: 'Telefone' },
    { key: 'email' as keyof ProfileLead, label: 'Email' },
    { key: 'empresa' as keyof ProfileLead, label: 'Empresa' },
    { key: 'cargo' as keyof ProfileLead, label: 'Cargo' },
    { key: 'faturamento' as keyof ProfileLead, label: 'Faturamento' },
    { key: 'utm_source' as keyof ProfileLead, label: 'UTM Source' },
    { key: 'utm_medium' as keyof ProfileLead, label: 'UTM Medium' },
    { key: 'utm_campaign' as keyof ProfileLead, label: 'UTM Campaign' },
    { key: 'utm_content' as keyof ProfileLead, label: 'UTM Content' },
    { key: 'utm_term' as keyof ProfileLead, label: 'UTM Term' },
    { key: 'form_name' as keyof ProfileLead, label: 'Funil' },
    { key: 'unidade' as keyof ProfileLead, label: 'Unidade' },
    { key: 'data_cadastro' as keyof ProfileLead, label: 'Data Cadastro' },
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Perfis Detalhados</h3>
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
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Users className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Perfis Detalhados ({filteredAndSortedLeads.length})
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar perfis..."
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
              {currentLeads.map((lead, index) => (
                <tr key={lead.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={formatValue(lead[column.key], column.key)}>
                        {formatValue(lead[column.key], column.key)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedLeads.length)} de{' '}
              {filteredAndSortedLeads.length} registros
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
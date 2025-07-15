'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface PositionSourceMatrixProps {
  filters: QualitativeFilterState
}

interface MatrixCell {
  cargo: string
  source: string
  count: number
  percentage: number
}

export default function PositionSourceMatrix({ filters }: PositionSourceMatrixProps) {
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([])
  const [cargos, setCargos] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [maxCount, setMaxCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadMatrixData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('cargo, utm_source, data_cadastro, unidade, utm_medium, utm_campaign, utm_content, utm_term')

      if (error) throw error

      if (allLeads && allLeads.length > 0) {
        // Aplicar filtros
        let filteredLeads = allLeads

        // Filtro de período
        if (filters.startDate && filters.endDate) {
          filteredLeads = filteredLeads.filter(lead => {
            if (!lead.data_cadastro) return false
            const date = new Date(lead.data_cadastro)
            const start = new Date(filters.startDate)
            const end = new Date(filters.endDate)
            return date >= start && date <= end
          })
        }

        // Aplicar filtros UTM e conta
        if (filters.conta.length > 0) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.unidade && filters.conta.includes(lead.unidade)
          )
        }

        if (filters.utmSource.length > 0) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.utm_source && filters.utmSource.includes(lead.utm_source)
          )
        }

        if (filters.utmMedium.length > 0) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.utm_medium && filters.utmMedium.includes(lead.utm_medium)
          )
        }

        if (filters.utmCampaign.length > 0) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.utm_campaign && filters.utmCampaign.includes(lead.utm_campaign)
          )
        }

        if (filters.utmContent.length > 0) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.utm_content && filters.utmContent.includes(lead.utm_content)
          )
        }

        if (filters.utmTerm.length > 0) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.utm_term && filters.utmTerm.includes(lead.utm_term)
          )
        }

        // Extrair cargos e sources únicos
        // Criar matriz de dados
        const matrix: MatrixCell[] = []
        const cargosList = [...new Set(filteredLeads.map(lead => lead.cargo || 'Não informado'))]
        const sourcesList = [...new Set(filteredLeads.map(lead => lead.utm_source || 'Não informado'))]

        setCargos(cargosList.slice(0, 15)) // Limitar a 15 cargos
        setSources(sourcesList.slice(0, 10)) // Limitar a 10 sources

        let maxCount = 0

        cargosList.slice(0, 15).forEach(cargo => {
          sourcesList.slice(0, 10).forEach(source => {
            const count = filteredLeads.filter(lead => 
              (lead.cargo || 'Não informado') === cargo && 
              (lead.utm_source || 'Não informado') === source
            ).length

            if (count > maxCount) maxCount = count

            const total = filteredLeads.length
            matrix.push({
              cargo,
              source,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0
            })
          })
        })

        setMatrixData(matrix)
        setMaxCount(maxCount)
      } else {
        setMatrixData([])
        setCargos([])
        setSources([])
        setMaxCount(0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da matriz:', error)
      setMatrixData([])
      setCargos([])
      setSources([])
      setMaxCount(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadMatrixData()
  }, [loadMatrixData])

  const getCellIntensity = (count: number) => {
    if (maxCount === 0) return 0
    return (count / maxCount) * 100
  }

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-gray-50'
    const intensity = getCellIntensity(count)
    if (intensity < 20) return 'bg-blue-100'
    if (intensity < 40) return 'bg-blue-200'
    if (intensity < 60) return 'bg-blue-300'
    if (intensity < 80) return 'bg-blue-400'
    return 'bg-blue-500'
  }

  const getCellTextColor = (count: number) => {
    const intensity = getCellIntensity(count)
    return intensity >= 60 ? 'text-white' : 'text-gray-900'
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (matrixData.length === 0 || cargos.length === 0 || sources.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Matriz Calor: Cargo × Fonte</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Dados insuficientes para gerar a matriz de correlação</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">Matriz Calor: Cargo × Fonte</h3>
        <span className="text-sm text-gray-500">(Correlação entre cargos e canais de aquisição)</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Cabeçalho das fontes */}
          <div className="flex mb-2">
            <div className="w-40 flex-shrink-0"></div>
            {sources.map(source => (
              <div key={source} className="w-24 text-xs font-medium text-center p-2 text-gray-700">
                {source.length > 10 ? source.substring(0, 10) + '...' : source}
              </div>
            ))}
          </div>

          {/* Linhas da matriz */}
          {cargos.map(cargo => (
            <div key={cargo} className="flex items-center mb-1">
              <div className="w-40 flex-shrink-0 text-sm font-medium text-gray-700 pr-2 truncate" title={cargo}>
                {cargo}
              </div>
              {sources.map(source => {
                const cell = matrixData.find(m => m.cargo === cargo && m.source === source)
                const count = cell?.count || 0
                return (
                  <div
                    key={`${cargo}-${source}`}
                    className={`w-24 h-12 flex items-center justify-center text-sm font-medium border border-gray-200 ${getCellColor(count)} ${getCellTextColor(count)}`}
                    title={`${cargo} × ${source}: ${count} leads`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Menor intensidade</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200"></div>
          <div className="w-4 h-4 bg-blue-100 border border-gray-200"></div>
          <div className="w-4 h-4 bg-blue-200 border border-gray-200"></div>
          <div className="w-4 h-4 bg-blue-300 border border-gray-200"></div>
          <div className="w-4 h-4 bg-blue-400 border border-gray-200"></div>
          <div className="w-4 h-4 bg-blue-500 border border-gray-200"></div>
        </div>
        <span>Maior intensidade (máx: {maxCount} leads)</span>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { Grid3X3 } from 'lucide-react'
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

  useEffect(() => {
    loadMatrixData()
  }, [filters])

  const loadMatrixData = async () => {
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

        // Filtrar apenas leads com cargo e utm_source preenchidos
        const validLeads = filteredLeads.filter(lead => 
          lead.cargo && lead.cargo.trim() !== '' &&
          lead.utm_source && lead.utm_source.trim() !== ''
        )

        if (validLeads.length > 0) {
          // Obter listas únicas de cargos e sources
          const uniqueCargos = [...new Set(validLeads.map(l => l.cargo.trim()))].sort()
          const uniqueSources = [...new Set(validLeads.map(l => l.utm_source.trim()))].sort()

          // Limitar a 10 cargos e 8 sources mais frequentes para não sobrecarregar a tela
          const cargoFreq: { [key: string]: number } = {}
          const sourceFreq: { [key: string]: number } = {}

          validLeads.forEach(lead => {
            cargoFreq[lead.cargo.trim()] = (cargoFreq[lead.cargo.trim()] || 0) + 1
            sourceFreq[lead.utm_source.trim()] = (sourceFreq[lead.utm_source.trim()] || 0) + 1
          })

          const topCargos = Object.entries(cargoFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([cargo]) => cargo)

          const topSources = Object.entries(sourceFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([source]) => source)

          // Criar matriz
          const matrix: MatrixCell[] = []
          let max = 0

          topCargos.forEach(cargo => {
            topSources.forEach(source => {
              const count = validLeads.filter(lead => 
                lead.cargo.trim() === cargo && lead.utm_source.trim() === source
              ).length

              if (count > max) max = count

              matrix.push({
                cargo,
                source,
                count,
                percentage: validLeads.length > 0 ? (count / validLeads.length) * 100 : 0
              })
            })
          })

          setMatrixData(matrix)
          setCargos(topCargos)
          setSources(topSources)
          setMaxCount(max)
        } else {
          setMatrixData([])
          setCargos([])
          setSources([])
          setMaxCount(0)
        }
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
  }

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
          <Grid3X3 className="h-5 w-5 text-gray-500" />
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
        <Grid3X3 className="h-5 w-5 text-gray-500" />
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
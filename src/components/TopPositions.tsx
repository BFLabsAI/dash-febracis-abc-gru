'use client'

import { useState, useEffect } from 'react'
import { Briefcase } from 'lucide-react'
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

interface TopPositionsProps {
  filters: QualitativeFilterState
}

interface PositionData {
  cargo: string
  count: number
  percentage: number
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280']

export default function TopPositions({ filters }: TopPositionsProps) {
  const [positionsData, setPositionsData] = useState<PositionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPositionsData()
  }, [filters])

  const loadPositionsData = async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('cargo, data_cadastro, unidade, utm_source, utm_medium, utm_campaign, utm_content, utm_term')

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

        // Filtrar apenas leads com cargo preenchido
        const leadsWithPosition = filteredLeads.filter(lead => 
          lead.cargo && lead.cargo.trim() !== ''
        )

        if (leadsWithPosition.length > 0) {
          // Agrupar por cargo
          const positionGroups: { [key: string]: number } = {}
          leadsWithPosition.forEach(lead => {
            const cargo = lead.cargo.trim()
            positionGroups[cargo] = (positionGroups[cargo] || 0) + 1
          })

          const total = Object.values(positionGroups).reduce((sum, count) => sum + count, 0)

          // Converter para array e pegar top 15
          const positionsArray = Object.entries(positionGroups)
            .map(([cargo, count]) => ({
              cargo,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15)

          setPositionsData(positionsArray)
        } else {
          setPositionsData([])
        }
      } else {
        setPositionsData([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de cargos:', error)
      setPositionsData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (positionsData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Top 15 Cargos</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum cargo identificado no período selecionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">Top 15 Cargos</h3>
        <span className="text-sm text-gray-500">({positionsData.length} cargos identificados)</span>
      </div>

      <div className="space-y-3">
        {positionsData.map((position, index) => (
          <div key={position.cargo} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4" title={position.cargo}>
                {index + 1}. {position.cargo}
              </span>
              <div className="text-right flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {position.count} leads
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {position.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-300 group-hover:opacity-80"
                style={{
                  width: `${position.percentage}%`,
                  backgroundColor: COLORS[index % COLORS.length]
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {positionsData.length === 15 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Mostrando apenas os 15 cargos mais frequentes
        </div>
      )}
    </div>
  )
} 
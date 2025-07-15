'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign } from 'lucide-react'
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

interface TopRevenueProps {
  filters: QualitativeFilterState
}

interface RevenueData {
  revenue: string
  count: number
  percentage: number
  color: string
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280']

export default function TopRevenue({ filters }: TopRevenueProps) {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  const loadRevenueData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('faturamento, data_cadastro, unidade, utm_source, utm_medium, utm_campaign, utm_content, utm_term')

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

        // Agrupar por faixa de receita
        const revenueCounts: { [key: string]: number } = {}
        filteredLeads.forEach(lead => {
          const revenue = lead.faturamento || 'Não informado'
          revenueCounts[revenue] = (revenueCounts[revenue] || 0) + 1
        })

        const total = filteredLeads.length
        const processedData: RevenueData[] = Object.entries(revenueCounts)
          .map(([revenue, count], index) => ({
            revenue,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15) // Top 15

        setRevenueData(processedData)
      } else {
        setRevenueData([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de receita:', error)
      setRevenueData([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadRevenueData()
  }, [loadRevenueData])

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

  if (revenueData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Top 15 Faturamento</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum faturamento identificado no período selecionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">Top 15 Faixas de Faturamento</h3>
        <span className="text-sm text-gray-500">({revenueData.length} faixas identificadas)</span>
      </div>

      <div className="space-y-3">
        {revenueData.map((revenue, index) => (
          <div key={revenue.revenue} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4" title={revenue.revenue}>
                {index + 1}. {revenue.revenue}
              </span>
              <div className="text-right flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {revenue.count} leads
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {revenue.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-300 group-hover:opacity-80"
                style={{
                  width: `${revenue.percentage}%`,
                  backgroundColor: revenue.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {revenueData.length === 15 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Mostrando apenas as 15 faixas de faturamento mais frequentes
        </div>
      )}
    </div>
  )
} 
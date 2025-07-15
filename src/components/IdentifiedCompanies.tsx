'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building } from 'lucide-react'
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

interface IdentifiedCompaniesProps {
  filters: QualitativeFilterState
}

export default function IdentifiedCompanies({ filters }: IdentifiedCompaniesProps) {
  const [identifiedCount, setIdentifiedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadCompaniesData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('empresa, data_cadastro, unidade, utm_source, utm_medium, utm_campaign, utm_content, utm_term')

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

        // Filtros UTM e conta
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

        // Contar empresas identificadas (excluindo null e "NULL")
        const identifiedCompanies = filteredLeads.filter(lead => 
          lead.empresa && lead.empresa.toLowerCase() !== 'null'
        )

        setIdentifiedCount(identifiedCompanies.length)
        setTotalCount(filteredLeads.length)
      } else {
        setIdentifiedCount(0)
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de empresas:', error)
      setIdentifiedCount(0)
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadCompaniesData()
  }, [loadCompaniesData])

  const percentage = totalCount > 0 ? (identifiedCount / totalCount) * 100 : 0

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-blue-50">
          <Building className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Empresas Identificadas</h3>
          <p className="text-sm text-gray-600">Leads com nome da empresa informado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {identifiedCount.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-gray-600">Empresas identificadas</div>
        </div>

        <div>
          <div className="text-2xl font-semibold text-gray-700 mb-1">
            {totalCount.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-gray-600">Total de leads</div>
        </div>

        <div>
          <div className="text-2xl font-semibold text-green-600 mb-1">
            {percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Taxa de identificação</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>Taxa de identificação de empresas</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
} 
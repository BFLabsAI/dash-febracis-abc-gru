'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { isDateInRange } from '@/lib/dateUtils'

interface FilterState {
  startDate: string
  endDate: string
  conta: string[]
  funil: string[]
}

interface LeadsByRegionProps {
  filters: FilterState
}

interface RegionData {
  region: string
  count: number
  percentage: number
}

export default function LeadsByRegion({ filters }: LeadsByRegionProps) {
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRegionData()
  }, [filters])

  const loadRegionData = async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('regiao, data_cadastro, unidade, form_name')

      if (error) throw error

      if (allLeads && allLeads.length > 0) {
        let leads = allLeads

        if (filters.conta.length > 0) {
          leads = leads.filter(lead => 
            lead.unidade && filters.conta.includes(lead.unidade)
          )
        }

        if (filters.funil.length > 0) {
          leads = leads.filter(lead => 
            lead.form_name && filters.funil.includes(lead.form_name)
          )
        }

        if (filters.startDate && filters.endDate) {
          leads = leads.filter(lead => {
            if (!lead.data_cadastro) return false
            const date = new Date(lead.data_cadastro)
            const start = new Date(filters.startDate)
            const end = new Date(filters.endDate)
            return date >= start && date <= end
          })
        }

        // Agrupar por região
        const regionGroups: { [key: string]: number } = {}
        
        leads.forEach(lead => {
          const regiao = lead.regiao || 'Não informado'
          regionGroups[regiao] = (regionGroups[regiao] || 0) + 1
        })

        // Calcular total para percentuais
        const total = Object.values(regionGroups).reduce((sum, count) => sum + count, 0)

        // Converter para array
        const regionData = Object.entries(regionGroups)
          .map(([region, count]) => ({
            region,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)

        setRegionData(regionData)
      } else {
        // Dados de exemplo baseados no CSV
        let leads = [
          {
            regiao: 'ABC Paulista',
            data_cadastro: '15-07-2025 06:01',
            unidade: 'ds_performance',
            form_name: 'MCIS - Nova Pagina 01'
          },
          {
            regiao: 'Baixada',
            data_cadastro: '15-07-2025 06:20',
            unidade: 'Febracis_GRU',
            form_name: 'ML5 - FORM'
          },
          {
            regiao: 'Baixada Santista',
            data_cadastro: '15-07-2025 06:22',
            unidade: 'Febracis_GRU',
            form_name: 'ML5 - FORM'
          }
        ]
        console.log('LeadsByRegion: Usando dados de exemplo')

        if (filters.conta.length > 0) {
          leads = leads.filter(lead => 
            lead.unidade && filters.conta.includes(lead.unidade)
          )
        }

        if (filters.funil.length > 0) {
          leads = leads.filter(lead => 
            lead.form_name && filters.funil.includes(lead.form_name)
          )
        }

        if (filters.startDate && filters.endDate) {
          leads = leads.filter(lead => {
            if (!lead.data_cadastro) return false
            const date = new Date(lead.data_cadastro)
            const start = new Date(filters.startDate)
            const end = new Date(filters.endDate)
            return date >= start && date <= end
          })
        }

        // Agrupar por região
        const regionGroups: { [key: string]: number } = {}
        
        leads.forEach(lead => {
          const regiao = lead.regiao || 'Não informado'
          regionGroups[regiao] = (regionGroups[regiao] || 0) + 1
        })

        // Calcular total para percentuais
        const total = Object.values(regionGroups).reduce((sum, count) => sum + count, 0)

        // Converter para array
        const regionData = Object.entries(regionGroups)
          .map(([region, count]) => ({
            region,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)

        setRegionData(regionData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados por região:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Leads por Região</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">Leads por Região</h3>
      </div>

      {regionData.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum dado encontrado</p>
      ) : (
        <div className="space-y-3">
          {regionData.map((item, index) => (
            <div key={item.region} className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                  {index + 1}. {item.region}
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300 group-hover:bg-yellow-600"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {regionData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Top {regionData.length} regiões com maior volume de leads
          </p>
        </div>
      )}
    </div>
  )
} 
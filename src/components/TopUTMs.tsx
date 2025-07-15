'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { isDateInRange } from '@/lib/dateUtils'

interface FilterState {
  startDate: string
  endDate: string
  conta: string[]
  funil: string[]
}

interface TopUTMsProps {
  filters: FilterState
}

interface UTMData {
  name: string
  fullName?: string
  value: number
  percentage: number
}

interface UTMSection {
  title: string
  field: string
  data: UTMData[]
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444']

export default function TopUTMs({ filters }: TopUTMsProps) {
  const [utmSections, setUtmSections] = useState<UTMSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUTMData()
  }, [filters])

  const loadUTMData = async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('utm_source, utm_medium, utm_campaign, utm_content, utm_term, data_cadastro, unidade, form_name')

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

        // Função auxiliar para agrupar e pegar top 5 de um campo
        function getTop5(field: string, label: string): UTMSection {
          const groups: { [key: string]: number } = {}
          leads.forEach(lead => {
            const value = lead[field as keyof typeof lead] || 'Não informado'
            groups[value] = (groups[value] || 0) + 1
          })
          const total = Object.values(groups).reduce((sum, count) => sum + count, 0)
          const data = Object.entries(groups)
            .map(([name, value]) => ({
              name: name.length > 25 ? name.substring(0, 25) + '...' : name,
              fullName: name,
              value,
              percentage: total > 0 ? (value / total) * 100 : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
          return { title: label, field, data }
        }

        setUtmSections([
          getTop5('utm_source', 'Top 5 Fontes (utm_source)'),
          getTop5('utm_medium', 'Top 5 Meios (utm_medium)'),
          getTop5('utm_campaign', 'Top 5 Campanhas (utm_campaign)'),
          getTop5('utm_content', 'Top 5 Conteúdos (utm_content)'),
          getTop5('utm_term', 'Top 5 Termos (utm_term)'),
        ])
      } else {
        // Dados de exemplo baseados no CSV
        let leads = [
          {
            utm_source: 'FacebookAds',
            utm_medium: 'teste',
            utm_campaign: 'teste',
            utm_content: 'teste',
            utm_term: 'teste',
            data_cadastro: '15-07-2025 06:01',
            unidade: 'ds_performance',
            form_name: 'MCIS - Nova Pagina 01'
          },
          {
            utm_source: 'FacebookAds',
            utm_medium: 'teste',
            utm_campaign: 'teste',
            utm_content: 'teste',
            utm_term: 'teste',
            data_cadastro: '15-07-2025 06:19',
            unidade: 'Febracis_Santo_Andre',
            form_name: 'GESTAO-360'
          },
          {
            utm_source: 'FacebookAds',
            utm_medium: 'teste',
            utm_campaign: 'teste',
            utm_content: 'teste',
            utm_term: 'teste',
            data_cadastro: '15-07-2025 06:20',
            unidade: 'Febracis_GRU',
            form_name: 'ML5 - FORM'
          }
        ]
        console.log('TopUTMs: Usando dados de exemplo')

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

        // Função auxiliar para agrupar e pegar top 5 de um campo
        function getTop5(field: string, label: string): UTMSection {
          const groups: { [key: string]: number } = {}
          leads.forEach(lead => {
            const value = lead[field as keyof typeof lead] || 'Não informado'
            groups[value] = (groups[value] || 0) + 1
          })
          const total = Object.values(groups).reduce((sum, count) => sum + count, 0)
          const data = Object.entries(groups)
            .map(([name, value]) => ({
              name: name.length > 25 ? name.substring(0, 25) + '...' : name,
              fullName: name,
              value,
              percentage: total > 0 ? (value / total) * 100 : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
          return { title: label, field, data }
        }

        setUtmSections([
          getTop5('utm_source', 'Top 5 Fontes (utm_source)'),
          getTop5('utm_medium', 'Top 5 Meios (utm_medium)'),
          getTop5('utm_campaign', 'Top 5 Campanhas (utm_campaign)'),
          getTop5('utm_content', 'Top 5 Conteúdos (utm_content)'),
          getTop5('utm_term', 'Top 5 Termos (utm_term)'),
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar UTMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.fullName || data.name}</p>
          <p className="text-sm text-gray-600">
            Leads: {data.value} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">Top 5 UTMs</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {utmSections.map((section, sectionIndex) => (
          <div key={section.field} className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-md font-semibold text-gray-800 mb-4">{section.title}</h4>
            
            {section.data.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum dado encontrado</p>
            ) : (
              <div className="space-y-3">
                {section.data.map((item, index) => (
                  <div key={item.name} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2" title={item.fullName || item.name}>
                        {index + 1}. {item.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.value}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 group-hover:opacity-80"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 
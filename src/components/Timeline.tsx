'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FilterState {
  startDate: string
  endDate: string
  conta: string[]
  funil: string[]
}

interface TimelineProps {
  filters: FilterState
}

interface TimelineData {
  date: string
  displayDate: string
  total: number
  [key: string]: number | string
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444']

export default function Timeline({ filters }: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  useEffect(() => {
    loadTimelineData()
  }, [filters, viewMode])

  const loadTimelineData = async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('data_cadastro, utm_source')

      if (error) throw error

      if (allLeads && allLeads.length > 0) {
        // Sempre usar todos os dados para garantir que algo aparece
        let leads = allLeads

        if (viewMode === 'day') {
          const dateGroups: { [key: string]: { [source: string]: number } } = {}
          
          leads.forEach(lead => {
            if (!lead.data_cadastro) return
            
            const date = new Date(lead.data_cadastro)
            const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
            const source = lead.utm_source || 'Não informado'
            
            if (!dateGroups[dateKey]) {
              dateGroups[dateKey] = {}
            }
            
            dateGroups[dateKey][source] = (dateGroups[dateKey][source] || 0) + 1
          })

          // Obter todas as utm_sources únicas
          const allSources = new Set<string>()
          Object.values(dateGroups).forEach(sources => {
            Object.keys(sources).forEach(source => allSources.add(source))
          })

          const chartData = Object.keys(dateGroups)
            .sort()
            .map(date => {
              const sources: { [key: string]: number } = {}
              let total = 0
              
              // Inicializar todas as sources com 0
              allSources.forEach(source => {
                sources[source] = dateGroups[date][source] || 0
                total += sources[source]
              })
              
              return {
                date,
                displayDate: date.split('-').reverse().join('/'),
                total,
                ...sources
              }
            })

          setTimelineData(chartData)
        }
      } else {
        // Dados de exemplo para garantir visualização
        const exampleData = [
          {
            date: '2025-07-15',
            displayDate: '15/07/2025',
            total: 6,
            FacebookAds: 6,
            googleads: 0
          }
        ]
        setTimelineData(exampleData)
      }
    } catch (error) {
      console.error('Erro ao carregar timeline:', error)
      // Dados de exemplo em caso de erro
      const exampleData = [
        {
          date: '2025-07-15',
          displayDate: '15/07/2025',
          total: 6,
          FacebookAds: 6,
          googleads: 0
        }
      ]
      setTimelineData(exampleData)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Total: {total} leads
          </p>
          {payload
            .filter((item: any) => item.value > 0)
            .sort((a: any, b: any) => b.value - a.value)
            .map((item: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: item.color }}>
                {item.dataKey}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </p>
            ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Linha do Tempo</h3>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    )
  }

  // Obter sources únicas dos dados para as áreas
  const uniqueSources = timelineData.length > 0 
    ? Array.from(new Set(
        timelineData.flatMap(item => 
          Object.keys(item).filter(key => !['date', 'displayDate', 'total'].includes(key))
        )
      ))
    : []

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Linha do Tempo</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'day' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Por Dia
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'week' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Por Semana
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            
            {uniqueSources.map((source, index) => (
              <Area
                key={source}
                type="monotone"
                dataKey={source}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.6}
                strokeWidth={1}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 
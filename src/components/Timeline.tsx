'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { parseBrazilianDateLocal, isDateInRange, toBrazilianDateString } from '@/lib/dateUtils'

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
  total: number
  [key: string]: any // Para UTM sources dinâmicas
}

const COLORS = [
  '#F59E0B', // yellow-500
  '#10B981', // green-500
  '#3B82F6', // blue-500
  '#8B5CF6', // purple-500
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#EC4899', // pink-500
  '#6B7280'  // gray-500
]

export default function Timeline({ filters }: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [utmSources, setUtmSources] = useState<string[]>([])

  useEffect(() => {
    loadTimelineData()
  }, [filters, viewMode])

  const loadTimelineData = async () => {
    setLoading(true)
    try {
      const { data: allLeads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('data_cadastro, utm_source, unidade, form_name')

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
            return isDateInRange(lead.data_cadastro, filters.startDate, filters.endDate)
          })
        }

        if (leads.length > 0) {
          // Determinar período
          let startDate: Date, endDate: Date
          
          if (filters.startDate && filters.endDate) {
            startDate = new Date(filters.startDate)
            endDate = new Date(filters.endDate)
          } else {
            const validDates = leads
              .map(lead => parseBrazilianDateLocal(lead.data_cadastro))
              .filter(Boolean)
              .sort((a, b) => a!.getTime() - b!.getTime())
            
            if (validDates.length > 0) {
              startDate = validDates[0]!
              endDate = validDates[validDates.length - 1]!
            } else {
              endDate = new Date()
              startDate = new Date()
              startDate.setDate(startDate.getDate() - 30)
            }
          }
          
          // Gerar intervalos
          const intervals = viewMode === 'day' 
            ? eachDayOfInterval({ start: startDate, end: endDate })
            : eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })

          const uniqueUtmSources = [...new Set(leads.map(lead => lead.utm_source || 'Não informado'))]
            .filter(Boolean)
          setUtmSources(uniqueUtmSources)

          // Agrupar dados
          const groupedData: { [key: string]: { [source: string]: number } } = {}
          
          intervals.forEach(interval => {
            const dateKey = viewMode === 'day' 
              ? format(interval, 'yyyy-MM-dd')
              : format(startOfWeek(interval, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            
            groupedData[dateKey] = {}
            uniqueUtmSources.forEach(source => {
              groupedData[dateKey][source] = 0
            })
          })

          leads.forEach(lead => {
            const leadDate = new Date(lead.data_cadastro)
            if (!leadDate) return
            const dateKey = format(leadDate, 'yyyy-MM-dd')
            const source = lead.utm_source || 'Não informado'
            if (groupedData[dateKey]) {
              groupedData[dateKey][source] = (groupedData[dateKey][source] || 0) + 1
            }
          })

          const chartData = Object.entries(groupedData).map(([date, sources]) => {
            const total = Object.values(sources).reduce((sum, count) => sum + count, 0)
            return {
              date,
              displayDate: date.split('-').reverse().join('/'),
              total,
              ...sources
            }
          }).sort((a, b) => a.date.localeCompare(b.date))

          setTimelineData(chartData)
        } else {
          setTimelineData([])
        }
      } else {
        // Dados de exemplo baseados no CSV
        let leads = [
          {
            data_cadastro: '15-07-2025 06:01',
            utm_source: 'FacebookAds',
            unidade: 'ds_performance',
            form_name: 'MCIS - Nova Pagina 01'
          },
          {
            data_cadastro: '15-07-2025 06:19',
            utm_source: 'FacebookAds',
            unidade: 'Febracis_Santo_Andre',
            form_name: 'GESTAO-360'
          },
          {
            data_cadastro: '15-07-2025 06:20',
            utm_source: 'FacebookAds',
            unidade: 'Febracis_GRU',
            form_name: 'ML5 - FORM'
          }
        ]
        console.log('Timeline: Usando dados de exemplo')

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
            return isDateInRange(lead.data_cadastro, filters.startDate, filters.endDate)
          })
        }

        if (leads.length > 0) {
          // Determinar período
          let startDate: Date, endDate: Date
          
          if (filters.startDate && filters.endDate) {
            startDate = new Date(filters.startDate)
            endDate = new Date(filters.endDate)
          } else {
            const validDates = leads
              .map(lead => parseBrazilianDateLocal(lead.data_cadastro))
              .filter(Boolean)
              .sort((a, b) => a!.getTime() - b!.getTime())
            
            if (validDates.length > 0) {
              startDate = validDates[0]!
              endDate = validDates[validDates.length - 1]!
            } else {
              endDate = new Date()
              startDate = new Date()
              startDate.setDate(startDate.getDate() - 30)
            }
          }
          
          // Gerar intervalos
          const intervals = viewMode === 'day' 
            ? eachDayOfInterval({ start: startDate, end: endDate })
            : eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })

          const uniqueUtmSources = [...new Set(leads.map(lead => lead.utm_source || 'Não informado'))]
            .filter(Boolean)
          setUtmSources(uniqueUtmSources)

          // Agrupar dados
          const groupedData: { [key: string]: { [source: string]: number } } = {}
          
          intervals.forEach(interval => {
            const dateKey = viewMode === 'day' 
              ? format(interval, 'yyyy-MM-dd')
              : format(startOfWeek(interval, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            
            groupedData[dateKey] = {}
            uniqueUtmSources.forEach(source => {
              groupedData[dateKey][source] = 0
            })
          })

          leads.forEach(lead => {
            const leadDate = new Date(lead.data_cadastro)
            if (!leadDate) return
            const dateKey = format(leadDate, 'yyyy-MM-dd')
            const source = lead.utm_source || 'Não informado'
            if (groupedData[dateKey]) {
              groupedData[dateKey][source] = (groupedData[dateKey][source] || 0) + 1
            }
          })

          const chartData = Object.entries(groupedData).map(([date, sources]) => {
            const total = Object.values(sources).reduce((sum, count) => sum + count, 0)
            return {
              date,
              displayDate: date.split('-').reverse().join('/'),
              total,
              ...sources
            }
          }).sort((a, b) => a.date.localeCompare(b.date))

          setTimelineData(chartData)
        } else {
          setTimelineData([])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            {payload[0]?.payload?.date ? 
              toBrazilianDateString(new Date(payload[0].payload.date)) : 
              label}
          </p>
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

      {timelineData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p className="text-lg">Nenhum dado encontrado para o período selecionado</p>
        </div>
      ) : (
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
              
              {utmSources.map((source, index) => (
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
      )}
    </div>
  )
} 
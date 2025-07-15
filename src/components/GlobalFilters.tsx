'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter } from 'lucide-react'
import { supabase, tryMultipleConnectionStrategies } from '@/lib/supabase'

interface FilterState {
  startDate: string
  endDate: string
  conta: string[]
  funil: string[]
}

interface GlobalFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function GlobalFilters({ filters, onFiltersChange }: GlobalFiltersProps) {
  const [contas, setContas] = useState<string[]>([])
  const [funis, setFunis] = useState<string[]>([])

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      console.log('🎛️ GlobalFilters: Carregando opções...')
      
      // Tentar carregar dados com múltiplas estratégias
      const result = await tryMultipleConnectionStrategies()
      
      if (result.success && result.data) {
        console.log(`✅ GlobalFilters: Sucesso com ${result.strategy}`)
        
        // Extrair unidades e funis únicos dos dados
        const uniqueUnidades = [...new Set(result.data.map((item: any) => item.unidade))]
          .filter(Boolean) as string[]
        
        const uniqueFunis = [...new Set(result.data.map((item: any) => item.form_name))]
          .filter(Boolean) as string[]
        
        setContas(uniqueUnidades)
        setFunis(uniqueFunis)
        
        console.log(`📊 Unidades: ${uniqueUnidades.length}, Funis: ${uniqueFunis.length}`)
      } else {
        console.log('🎛️ GlobalFilters: Usando opções de exemplo')
        // Fallback para dados de exemplo
        setContas(['ds_performance', 'Febracis_Santo_Andre', 'Febracis_GRU'])
        setFunis(['MCIS - Nova Pagina 01', 'GESTAO-360', 'ML5 - FORM'])
      }
    } catch (error) {
      console.error('❌ GlobalFilters erro:', error)
      // Fallback em caso de erro
      setContas(['ds_performance', 'Febracis_Santo_Andre', 'Febracis_GRU'])
      setFunis(['MCIS - Nova Pagina 01', 'GESTAO-360', 'ML5 - FORM'])
    }
  }

  const setQuickPeriod = (days: number) => {
    const end = new Date()
    const start = new Date()
    
    if (days === 0) {
      // Para "Hoje", usar início do dia até agora
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else {
      // Para outros períodos, usar dias anteriores
      start.setDate(start.getDate() - days)
    }
    
    const newFilters = {
      ...filters,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
    
    console.log(`📅 Período selecionado: ${days === 0 ? 'Hoje' : days + ' dias'} - ${newFilters.startDate} até ${newFilters.endDate}`)
    onFiltersChange(newFilters)
  }

  const handleContaChange = (conta: string) => {
    const newContas = filters.conta.includes(conta)
      ? filters.conta.filter(c => c !== conta)
      : [...filters.conta, conta]
    
    onFiltersChange({ ...filters, conta: newContas })
  }

  const handleFunilChange = (funil: string) => {
    const newFunis = filters.funil.includes(funil)
      ? filters.funil.filter(f => f !== funil)
      : [...filters.funil, funil]
    
    onFiltersChange({ ...filters, funil: newFunis })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-800">Filtros Globais</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 items-end">
        {/* Período */}
        <div className="md:col-span-2 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setQuickPeriod(0)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Hoje
              </button>
              <button
                onClick={() => setQuickPeriod(7)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                7d
              </button>
              <button
                onClick={() => setQuickPeriod(30)}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 font-medium"
              >
                30d
              </button>
              <button
                onClick={() => setQuickPeriod(90)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                90d
              </button>
            </div>
          </div>
        </div>

        {/* Unidade */}
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidade {/* Era Conta/Sistema */}
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {contas.length === 0 ? (
              <div className="text-xs text-gray-500 p-2">Carregando...</div>
            ) : (
              contas.map((conta) => (
                <label key={conta} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.conta.includes(conta)}
                    onChange={() => handleContaChange(conta)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-gray-700">{conta}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Funil */}
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funil (Form Name)
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {funis.length === 0 ? (
              <div className="text-xs text-gray-500 p-2">Carregando...</div>
            ) : (
              funis.map((funil) => (
                <label key={funil} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.funil.includes(funil)}
                    onChange={() => handleFunilChange(funil)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-gray-700">{funil}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Status dos filtros */}
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtros Ativos
          </label>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Período: {filters.startDate && filters.endDate ? 
              `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}` : 
              'Não definido'}</div>
            <div>Unidades: {filters.conta.length || 'Todas'}</div>
            <div>Funis: {filters.funil.length || 'Todos'}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
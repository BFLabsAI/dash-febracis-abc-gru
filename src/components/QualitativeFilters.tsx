'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter } from 'lucide-react'
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

interface QualitativeFiltersProps {
  filters: QualitativeFilterState
  onFiltersChange: (filters: QualitativeFilterState) => void
}

export default function QualitativeFilters({ filters, onFiltersChange }: QualitativeFiltersProps) {
  const [availableOptions, setAvailableOptions] = useState({
    contas: [] as string[],
    utmSources: [] as string[],
    utmMediums: [] as string[],
    utmCampaigns: [] as string[],
    utmContents: [] as string[],
    utmTerms: [] as string[]
  })

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads_febracis_abc_gru')
        .select('unidade, utm_source, utm_medium, utm_campaign, utm_content, utm_term')

      if (error) throw error

      if (leads) {
        setAvailableOptions({
          contas: [...new Set(leads.map(l => l.unidade).filter(Boolean))].sort(),
          utmSources: [...new Set(leads.map(l => l.utm_source).filter(Boolean))].sort(),
          utmMediums: [...new Set(leads.map(l => l.utm_medium).filter(Boolean))].sort(),
          utmCampaigns: [...new Set(leads.map(l => l.utm_campaign).filter(Boolean))].sort(),
          utmContents: [...new Set(leads.map(l => l.utm_content).filter(Boolean))].sort(),
          utmTerms: [...new Set(leads.map(l => l.utm_term).filter(Boolean))].sort()
        })
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error)
    }
  }

  const setQuickPeriod = (days: number) => {
    const end = new Date()
    const start = new Date()
    
    if (days === 0) {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else {
      start.setDate(start.getDate() - days)
    }
    
    onFiltersChange({
      ...filters,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    })
  }

  const handleMultiSelectChange = (field: keyof QualitativeFilterState, value: string) => {
    const currentValues = filters[field] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({ ...filters, [field]: newValues })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      conta: [],
      utmSource: [],
      utmMedium: [],
      utmCampaign: [],
      utmContent: [],
      utmTerm: []
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">Filtros de Análise Qualitativa</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
        {/* Período */}
        <div className="flex flex-col mb-2 xl:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Período
          </label>
          <div className="space-y-2">
            <div className="flex gap-2 flex-col sm:flex-row">
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
            <div className="flex gap-1 flex-wrap">
              {[
                { label: 'Hoje', days: 0 },
                { label: '7d', days: 7 },
                { label: '30d', days: 30 },
                { label: '90d', days: 90 }
              ].map(period => (
                <button
                  key={period.label}
                  onClick={() => setQuickPeriod(period.days)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conta/Sistema */}
        <div className="flex flex-col mb-2 xl:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conta/Sistema ({filters.conta.length})
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white">
            {availableOptions.contas.map(conta => (
              <label key={conta} className="flex items-center text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={filters.conta.includes(conta)}
                  onChange={() => handleMultiSelectChange('conta', conta)}
                  className="mr-2"
                />
                <span className="truncate">{conta}</span>
              </label>
            ))}
          </div>
        </div>

        {/* UTM Fonte */}
        <div className="flex flex-col mb-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTM Fonte ({filters.utmSource.length})
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white">
            {availableOptions.utmSources.map(source => (
              <label key={source} className="flex items-center text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={filters.utmSource.includes(source)}
                  onChange={() => handleMultiSelectChange('utmSource', source)}
                  className="mr-2"
                />
                <span className="truncate">{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* UTM Meio */}
        <div className="flex flex-col mb-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTM Meio ({filters.utmMedium.length})
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white">
            {availableOptions.utmMediums.map(medium => (
              <label key={medium} className="flex items-center text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={filters.utmMedium.includes(medium)}
                  onChange={() => handleMultiSelectChange('utmMedium', medium)}
                  className="mr-2"
                />
                <span className="truncate">{medium}</span>
              </label>
            ))}
          </div>
        </div>

        {/* UTM Campanha */}
        <div className="flex flex-col mb-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTM Campanha ({filters.utmCampaign.length})
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white">
            {availableOptions.utmCampaigns.map(campaign => (
              <label key={campaign} className="flex items-center text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={filters.utmCampaign.includes(campaign)}
                  onChange={() => handleMultiSelectChange('utmCampaign', campaign)}
                  className="mr-2"
                />
                <span className="truncate">{campaign}</span>
              </label>
            ))}
          </div>
        </div>

        {/* UTM Conteúdo */}
        <div className="flex flex-col mb-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTM Conteúdo ({filters.utmContent.length})
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white">
            {availableOptions.utmContents.map(content => (
              <label key={content} className="flex items-center text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={filters.utmContent.includes(content)}
                  onChange={() => handleMultiSelectChange('utmContent', content)}
                  className="mr-2"
                />
                <span className="truncate">{content}</span>
              </label>
            ))}
          </div>
        </div>

        {/* UTM Termo */}
        <div className="flex flex-col mb-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTM Termo ({filters.utmTerm.length})
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white">
            {availableOptions.utmTerms.map(term => (
              <label key={term} className="flex items-center text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={filters.utmTerm.includes(term)}
                  onChange={() => handleMultiSelectChange('utmTerm', term)}
                  className="mr-2"
                />
                <span className="truncate">{term}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Resumo dos Filtros */}
        <div className="flex flex-col mb-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtros Ativos
          </label>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Período: {filters.startDate && filters.endDate ? 
              `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}` : 
              'Não definido'}</div>
            <div>Total de filtros: {
              filters.conta.length + filters.utmSource.length + filters.utmMedium.length + 
              filters.utmCampaign.length + filters.utmContent.length + filters.utmTerm.length
            }</div>
          </div>
          <button
            onClick={clearAllFilters}
            className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Limpar Tudo
          </button>
        </div>
      </div>
    </div>
  )
} 
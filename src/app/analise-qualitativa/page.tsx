'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import QualitativeFilters from '@/components/QualitativeFilters'
import IdentifiedCompanies from '@/components/IdentifiedCompanies'
import TopPositions from '@/components/TopPositions'
import TopRevenue from '@/components/TopRevenue'
import PositionSourceMatrix from '@/components/PositionSourceMatrix'
import DetailedProfiles from '@/components/DetailedProfiles'

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

export default function AnaliseQualitativa() {
  const [filters, setFilters] = useState<QualitativeFilterState>({
    startDate: '',
    endDate: '',
    conta: [],
    utmSource: [],
    utmMedium: [],
    utmCampaign: [],
    utmContent: [],
    utmTerm: []
  })

  const handleFiltersChange = (newFilters: QualitativeFilterState) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Análise Qualitativa</h1>
          <p className="text-gray-600">Análise detalhada do perfil dos leads capturados</p>
        </div>

        {/* Filtros da Página */}
        <QualitativeFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
        />

        {/* Linha 1: Card Empresas Identificadas */}
        <IdentifiedCompanies filters={filters} />

        {/* Linha 2: Top 15 Cargos */}
        <TopPositions filters={filters} />

        {/* Linha 3: Top 15 Faturamento */}
        <TopRevenue filters={filters} />

        {/* Linha 4: Matriz Calor Campo × Fonte */}
        <PositionSourceMatrix filters={filters} />

        {/* Linha 5: Tabela Perfis Detalhados */}
        <DetailedProfiles filters={filters} />
      </main>
    </div>
  )
} 
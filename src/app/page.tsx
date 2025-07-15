'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import GlobalFilters from '@/components/GlobalFilters'
import BigNumbers from '@/components/BigNumbers'
import Timeline from '@/components/Timeline'
import LeadsByRegion from '@/components/LeadsByRegion'
import TopUTMs from '@/components/TopUTMs'
import LeadsTable from '@/components/LeadsTable'

interface FilterState {
  startDate: string
  endDate: string
  conta: string[]
  funil: string[]
}

// Remover o componente de diagnóstico Supabase
// Remover o banner informativo 'Dashboard com Diagnóstico Ativo'

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    conta: [],
    funil: []
  })

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtros Globais */}
        <GlobalFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
        />

        {/* Big Numbers */}
        <BigNumbers filters={filters} />

        {/* Timeline e Leads por Região - na mesma linha */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <Timeline filters={filters} />
          </div>
          <div className="lg:col-span-1">
            <LeadsByRegion filters={filters} />
          </div>
        </div>

        {/* Top 5 UTMs */}
        <TopUTMs filters={filters} />

        {/* Tabela de Leads */}
        <LeadsTable filters={filters} />
      </main>
    </div>
  )
}

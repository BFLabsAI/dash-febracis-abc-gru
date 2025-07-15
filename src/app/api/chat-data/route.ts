import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    // Carregar dados da tabela de leads
    const { data: leads, error } = await supabase
      .from('leads_febracis_abc_gru')
      .select('*')
    
    if (error) {
      console.error('Erro ao buscar leads:', error)
      return NextResponse.json({ error: 'Erro ao acessar banco de dados' }, { status: 500 })
    }

    // Estatísticas básicas
    const totalLeads = leads?.length || 0
    const contas = [...new Set(leads?.map(lead => lead.conta).filter(Boolean))]
    const funis = [...new Set(leads?.map(lead => lead.funil).filter(Boolean))]
    
    // Análise de UTM Sources
    const utmSources = leads?.map(lead => lead.utm_source).filter(Boolean)
    const utmSourceCounts = utmSources?.reduce((acc: Record<string, number>, source) => {
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topUtmSources = Object.entries(utmSourceCounts || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)

    // Análise de UTM Medium
    const utmMediums = leads?.map(lead => lead.utm_medium).filter(Boolean)
    const utmMediumCounts = utmMediums?.reduce((acc: Record<string, number>, medium) => {
      acc[medium] = (acc[medium] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topUtmMediums = Object.entries(utmMediumCounts || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)

    // Análise de UTM Campaign
    const utmCampaigns = leads?.map(lead => lead.utm_campaign).filter(Boolean)
    const utmCampaignCounts = utmCampaigns?.reduce((acc: Record<string, number>, campaign) => {
      acc[campaign] = (acc[campaign] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topUtmCampaigns = Object.entries(utmCampaignCounts || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)

    // Datas mais recentes
    const datesWithData = leads?.map(lead => lead.data_conversao).filter(Boolean).sort()
    const earliestDate = datesWithData?.[0]
    const latestDate = datesWithData?.[datesWithData.length - 1]
    
    // Empresas identificadas (excluindo null e "NULL")
    const companies = leads?.filter(lead => 
      lead.empresa && lead.empresa.toLowerCase() !== 'null'
    )
    const totalCompanies = companies?.length || 0
    
    // Posições mais comuns
    const positions = leads?.map(lead => lead.cargo).filter(Boolean)
    const positionCounts = positions?.reduce((acc: Record<string, number>, pos) => {
      acc[pos] = (acc[pos] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topPositions = Object.entries(positionCounts || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)

    // Análise de receita
    const revenues = leads?.map(lead => lead.receita_empresa).filter(Boolean)
    const revenueCounts = revenues?.reduce((acc: Record<string, number>, rev) => {
      acc[rev] = (acc[rev] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topRevenues = Object.entries(revenueCounts || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)

    // Análise temporal - leads por mês
    const leadsByMonth: { [key: string]: number } = {}
    leads?.forEach(lead => {
      if (lead.data_conversao) {
        const date = new Date(lead.data_conversao)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        leadsByMonth[monthKey] = (leadsByMonth[monthKey] || 0) + 1
      }
    })

    // Estado dos dados - estatísticas de completude
    const fieldsAnalysis = {
      email: leads?.filter(lead => lead.email).length || 0,
      whatsapp: leads?.filter(lead => lead.whatsapp).length || 0,
      empresa: leads?.filter(lead => lead.empresa && lead.empresa.toLowerCase() !== 'null').length || 0,
      cargo: leads?.filter(lead => lead.cargo).length || 0,
      utm_source: leads?.filter(lead => lead.utm_source).length || 0,
      utm_medium: leads?.filter(lead => lead.utm_medium).length || 0,
      utm_campaign: leads?.filter(lead => lead.utm_campaign).length || 0,
    }

    const dataContext = {
      totalLeads,
      contas,
      funis,
      topUtmSources,
      topUtmMediums,
      topUtmCampaigns,
      earliestDate,
      latestDate,
      totalCompanies,
      topPositions,
      topRevenues,
      leadsByMonth,
      fieldsAnalysis,
      leads: leads?.slice(0, 3) // Amostra dos primeiros 3 registros completos
    }

    return NextResponse.json({ 
      success: true, 
      data: dataContext,
      query: query
    })

  } catch (error) {
    console.error('Erro na API chat-data:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 
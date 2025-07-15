import { format, parse, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Converte data do formato brasileiro (DD-MM-YYYY HH:mm) para Date object (sempre local, nunca UTC)
 * @param dateString - String no formato "15-07-2025 06:01"
 * @returns Date object ou null se inválida
 */
export function parseBrazilianDateLocal(dateString: string): Date | null {
  if (!dateString) return null
  try {
    // Assume sempre formato ISO 8601 (timestampz)
    return new Date(dateString)
  } catch (error) {
    return null
  }
}

/**
 * Converte data do formato brasileiro (DD-MM-YYYY HH:mm) para Date object
 * @param dateString - String no formato "15-07-2025 06:01"
 * @returns Date object ou null se inválida
 */
export function parseBrazilianDate(dateString: string): Date | null {
  return parseBrazilianDateLocal(dateString)
}

/**
 * Converte Date para formato ISO (YYYY-MM-DD) para uso em filtros
 * @param date - Date object
 * @returns String no formato YYYY-MM-DD
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Converte Date para formato brasileiro (DD/MM/YYYY)
 * @param date - Date object
 * @returns String no formato DD/MM/YYYY
 */
export function toBrazilianDateString(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

/**
 * Converte Date para formato brasileiro com hora (DD/MM/YYYY HH:mm)
 * @param date - Date object
 * @returns String no formato DD/MM/YYYY HH:mm
 */
export function toBrazilianDateTimeString(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

/**
 * Converte data brasileira para SQL WHERE clause
 * Se a data estiver em DD-MM-YYYY, converte para formato SQL comparável
 * @param dateString - Data em formato brasileiro
 * @returns String para usar em comparações SQL ou null
 */
export function brazilianDateToSQLFormat(dateString: string): string | null {
  const date = parseBrazilianDate(dateString)
  if (!date) return null
  
  // Retorna no formato que o Supabase espera (ISO)
  return toISODateString(date)
}

/**
 * Verifica se uma data brasileira está dentro do range especificado
 * @param dateString - Data em formato brasileiro
 * @param startDate - Data início em formato ISO (YYYY-MM-DD)
 * @param endDate - Data fim em formato ISO (YYYY-MM-DD)
 * @returns boolean
 */
export function isDateInRange(dateString: string, startDate: string, endDate: string): boolean {
  const date = parseBrazilianDate(dateString)
  if (!date) return false
  
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  
  if (!isValid(start) || !isValid(end)) return false
  
  return date >= start && date <= end
}

/**
 * Extrai apenas a parte da data (sem hora) de uma string brasileira
 * @param dateString - Data em formato brasileiro com ou sem hora
 * @returns String no formato DD-MM-YYYY
 */
export function extractDateOnly(dateString: string): string {
  const date = parseBrazilianDate(dateString)
  if (!date) return dateString
  
  return format(date, 'dd-MM-yyyy')
} 
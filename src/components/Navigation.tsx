'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-yellow-600">FEBRACIS</h1>
              <p className="text-xs text-gray-500">Dashboard de Geração de Demanda</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Visão Geral de Demanda
            </Link>
            
            <Link
              href="/analise-qualitativa"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/analise-qualitativa' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Análise Qualitativa
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 
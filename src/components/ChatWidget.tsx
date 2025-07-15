'use client'

import { useState, useRef } from 'react'
import { marked } from 'marked'

const OPENROUTER_API_KEY = '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'
const OPENROUTER_MODEL = 'deepseek/deepseek-r1-0528:free'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Configurar marked para segurança e estilo
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Quebras de linha
})

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = input.trim()
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    
    try {
      // Primeiro, buscar dados do dashboard
      const dataResponse = await fetch('/api/chat-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      })
      
      const dataResult = await dataResponse.json()
      
      let systemPrompt = `Você é um assistente especializado em análise de dados de leads/prospects de marketing digital. Você tem acesso aos dados reais do dashboard e deve responder com base neles.

DADOS DISPONÍVEIS:

📊 **ESTATÍSTICAS GERAIS:**
- Total de leads: ${dataResult.data?.totalLeads || 0}
- Contas disponíveis: ${dataResult.data?.contas?.join(', ') || 'Nenhuma'}
- Funis disponíveis: ${dataResult.data?.funis?.join(', ') || 'Nenhum'}
- Período dos dados: ${dataResult.data?.earliestDate || 'N/A'} até ${dataResult.data?.latestDate || 'N/A'}
- Empresas identificadas: ${dataResult.data?.totalCompanies || 0}

🎯 **TOP UTM SOURCES:**
${dataResult.data?.topUtmSources?.map(([source, count]: [string, number]) => `- ${source}: ${count} leads`).join('\n') || 'Nenhum'}

📱 **TOP UTM MEDIUMS:**
${dataResult.data?.topUtmMediums?.map(([medium, count]: [string, number]) => `- ${medium}: ${count} leads`).join('\n') || 'Nenhum'}

🚀 **TOP UTM CAMPAIGNS:**
${dataResult.data?.topUtmCampaigns?.map(([campaign, count]: [string, number]) => `- ${campaign}: ${count} leads`).join('\n') || 'Nenhuma'}

👔 **TOP CARGOS:**
${dataResult.data?.topPositions?.map(([pos, count]: [string, number]) => `- ${pos}: ${count} pessoas`).join('\n') || 'Nenhum'}

💰 **TOP FAIXAS DE RECEITA:**
${dataResult.data?.topRevenues?.map(([rev, count]: [string, number]) => `- ${rev}: ${count} empresas`).join('\n') || 'Nenhuma'}

📈 **LEADS POR MÊS:**
${Object.entries(dataResult.data?.leadsByMonth || {}).map(([month, count]) => `- ${month}: ${count} leads`).join('\n') || 'Nenhum'}

📋 **COMPLETUDE DOS DADOS:**
- E-mails: ${dataResult.data?.fieldsAnalysis?.email || 0}/${dataResult.data?.totalLeads || 0}
- WhatsApp: ${dataResult.data?.fieldsAnalysis?.whatsapp || 0}/${dataResult.data?.totalLeads || 0}
- Empresas: ${dataResult.data?.fieldsAnalysis?.empresa || 0}/${dataResult.data?.totalLeads || 0}
- Cargos: ${dataResult.data?.fieldsAnalysis?.cargo || 0}/${dataResult.data?.totalLeads || 0}
- UTM Source: ${dataResult.data?.fieldsAnalysis?.utm_source || 0}/${dataResult.data?.totalLeads || 0}
- UTM Medium: ${dataResult.data?.fieldsAnalysis?.utm_medium || 0}/${dataResult.data?.totalLeads || 0}
- UTM Campaign: ${dataResult.data?.fieldsAnalysis?.utm_campaign || 0}/${dataResult.data?.totalLeads || 0}

INSTRUÇÕES:
- Use SEMPRE markdown para formatação (##, ###, **, listas, etc.)
- Seja específico e cite os números reais dos dados acima
- Responda em português brasileiro
- Formate as respostas de forma clara e organizada
- Use emojis quando apropriado para melhor visualização
- Calcule percentuais quando relevante
- Se perguntarem sobre leads específicos, use os dados reais disponíveis
- Para análises temporais, use os dados de "LEADS POR MÊS"
- Para análises de qualidade, use os dados de "COMPLETUDE DOS DADOS"

Pergunta do usuário: ${userMessage}`

      // Enviar para OpenRouter com contexto dos dados
      const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages.slice(-5).map(m => ({ role: m.role, content: m.content })) // Últimas 5 mensagens para contexto
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })
      
      const chatData = await chatResponse.json()
      const reply = chatData.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta.'
      
      setMessages([...newMessages, { role: 'assistant' as const, content: reply }])
      
    } catch (err) {
      console.error('Erro no chat:', err)
      setMessages([...newMessages, { 
        role: 'assistant' as const, 
        content: 'Erro ao processar sua pergunta. Tente novamente.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat"
        >
          💬
        </button>
      )}
      {/* Widget de chat */}
      {isOpen && (
        <div className="w-96 bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white border-2 border-blue-300 w-8 h-8 flex items-center justify-center">
                <span role="img" aria-label="Bot">🤖</span>
              </span>
              <span className="text-white font-semibold">Assistente do Dashboard</span>
            </div>
            <button
              className="text-white text-xl hover:text-blue-200"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat"
            >
              ×
            </button>
          </div>
          {/* Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50" style={{ maxHeight: 400 }}>
            {messages.length === 0 && (
              <div className="text-gray-600 text-sm text-center mt-8">
                <p className="mb-2">🎯 <strong>Pergunte sobre os dados!</strong></p>
                <p className="text-xs">Exemplos: "Quantos leads temos?", "Quais as principais fontes UTM?", "Análise por período"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[85%] text-sm shadow ${
                  msg.role === 'user' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'bg-white border text-gray-800'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div 
                      className="prose prose-sm max-w-none [&>h1]:text-base [&>h1]:font-semibold [&>h1]:mt-2 [&>h1]:mb-1 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-medium [&>h3]:mt-1 [&>h3]:mb-1 [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5"
                      dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 bg-white border text-gray-500 text-sm animate-pulse">
                  🤔 Analisando dados...
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder:text-gray-400"
              placeholder="Pergunte sobre os leads..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              aria-label="Digite sua pergunta"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Enviar"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
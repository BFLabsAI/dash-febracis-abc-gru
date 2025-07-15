# Dashboard Febracis - Geração de Demanda

Dashboard executivo para análise de leads e geração de demanda da Febracis ABC & GRU, desenvolvido com Next.js, TypeScript e Supabase.

## 🚀 Funcionalidades

### Página 1: Visão Geral de Demanda

#### Filtros Globais
- **Período**: Seletor de datas com botões rápidos (Hoje, 7d, 30d, 90d)
- **Conta/Sistema**: Filtro múltiplo por ABC, GRU, etc.
- **Funil**: Filtro múltiplo por form_name

#### Big Numbers (4 Cartões)
1. **Leads Gerados** - Contagem total de leads no período
2. **Leads Únicos** - Contagem distinta por telefone/email
3. **Leads/Dia** - Média diária de geração
4. **Leads 24h** - Leads cadastrados nas últimas 24 horas

#### Leads por Região
- Top 10 regiões com maior volume
- Visualização em barras horizontais
- Número absoluto e percentual

#### Linha do Tempo
- Gráfico de área empilhada
- Visualização por dia ou semana
- Segmentação por utm_source
- Tooltips com detalhamento

#### Top 5 UTMs
Cinco gráficos de barras horizontais para:
- **utm_source** (Fonte)
- **utm_medium** (Meio)  
- **utm_campaign** (Campanha)
- **utm_content** (Conteúdo)
- **utm_term** (Termo)

#### Tabela de Leads
- Todas as colunas do banco de dados
- Busca por texto em todos os campos
- Ordenação clicável por coluna
- Paginação (50 itens por página)
- **Exportação CSV** com filtros aplicados

### Página 2: Análise Qualitativa

#### Seletores Dinâmicos
- **Campo Qualitativo**: Empresa, Cargo, Funcionários, Faturamento
- **Dimensão UTM**: Source, Medium, Campaign, Content, Term
- **Filtros**: Herdam da Página 1 mas podem ser alterados

#### Gráficos Adaptativos
- **Empresa**: Barras horizontais Top 15
- **Cargo**: Treemap interativo
- **Funcionários**: Barras horizontais com faixas (1-9, 10-49, 50-99, 100-499, 500+)
- **Faturamento**: Barras horizontais com faixas (Até 100k, 100k-500k, 500k-1M, 1M-5M, 5M+)

#### Matriz de Calor
- Cruzamento Campo Qualitativo × Dimensão UTM
- Mostra apenas valores > 0
- Top 20 combinações mais relevantes

#### Tabela Detalhada
- Leads filtrados pelos critérios atuais
- Colunas: Nome, Telefone, Email, Campo Qualitativo, UTM, Funil, Data
- Limitada a 50 registros para performance

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Recharts** - Gráficos interativos
- **Supabase** - Banco de dados PostgreSQL
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

## 📊 Estrutura de Dados

### Tabela: `leads_febracis_abc_gru`

```typescript
interface Lead {
  id?: number
  nome?: string
  telefone?: string
  email?: string
  empresa?: string
  cargo?: string
  funcionarios?: number
  faturamento?: number
  regiao?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  form_name?: string
  conta_sistema?: string
  data_cadastro?: string
  created_at?: string
  updated_at?: string
}
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd dashbboard_febracis
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://gckszjgjlwgxxzmxcefc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componentes adaptativos**: Gráficos e tabelas se ajustam ao tamanho da tela

## 🎨 Design System

### Cores
- **Primária**: Yellow-500 (#F59E0B) - Febracis
- **Neutras**: Gray-50 a Gray-900
- **Estado**: Green, Blue, Purple, Red para categorização

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Escalas**: text-xs a text-2xl
- **Pesos**: font-medium, font-semibold, font-bold

## 📈 Performance

### Otimizações Implementadas
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: useMemo para cálculos pesados
- **Paginação**: Limitação de registros por página
- **Consultas otimizadas**: Filtros aplicados no banco
- **Loading States**: Skeleton screens durante carregamento

### Métricas de Performance
- **First Load**: < 3s
- **Navigation**: < 1s
- **Charts Rendering**: < 2s

## 🔒 Segurança

- **Row Level Security (RLS)**: Configurado no Supabase
- **Autenticação**: Anon key para acesso público controlado
- **Validação**: TypeScript para type safety
- **Sanitização**: Escape de dados para CSV export

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] Mapa de calor Dia × Hora (rodapé opcional)
- [ ] Drill-down temporal (dia → hora)
- [ ] Alerts automáticos por thresholds
- [ ] Dashboard em tempo real (WebSockets)
- [ ] Comparação entre períodos
- [ ] Segmentação avançada por personas

### Melhorias Técnicas
- [ ] Service Workers para cache
- [ ] Testes automatizados (Jest + Testing Library)
- [ ] CI/CD pipeline
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics de uso (Google Analytics)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da Febracis. Todos os direitos reservados.

## 📞 Suporte

Para dúvidas ou suporte técnico:
- **Email**: suporte@febracis.com.br
- **GitHub Issues**: Para bugs e melhorias
- **Documentação**: README.md e comentários no código

---

**Desenvolvido com ❤️ para Febracis ABC & GRU**

# 📱 Instalação das Novas Telas - AquaMonitor

## ✅ O que foi criado:

### 📄 Novos Arquivos:

1. **`/pages/HomePage.tsx`** - Tela principal (código refatorado)
2. **`/pages/HistoryPage.tsx`** - Tela de histórico e estatísticas com gráficos
3. **`/pages/ChatPage.tsx`** - Tela de chatbot IA com interface completa
4. **`/App.tsx`** (atualizado) - Gerenciamento de navegação entre telas

---

## 🚀 Instalação:

### 1️⃣ Instalar Dependência do Recharts

```bash
npm install recharts
```

### 2️⃣ Copiar os Arquivos

Copie os seguintes arquivos para seu projeto:

```
/pages/HomePage.tsx    →  ~/Projetos/tcc/pages/
/pages/HistoryPage.tsx →  ~/Projetos/tcc/pages/
/pages/ChatPage.tsx    →  ~/Projetos/tcc/pages/
```

### 3️⃣ Substituir App.tsx

**SUBSTITUA** o conteúdo do seu `App.tsx` pelo novo que foi gerado:

```
/App.tsx  →  ~/Projetos/tcc/App.tsx
```

### 4️⃣ Verificar Componentes UI

Certifique-se de ter estes componentes do Shadcn na pasta `components/ui/`:

- ✅ `button.tsx`
- ✅ `card.tsx`
- ✅ `badge.tsx`
- ✅ `input.tsx`
- ✅ `tabs.tsx`
- ✅ `alert.tsx`

Se não tiver, copie da pasta `/components/ui/` deste ambiente.

---

## ✨ Funcionalidades Implementadas:

### 🏠 Tela Principal (HomePage)
- ✅ Visualização do tanque 3D
- ✅ Controle da bomba
- ✅ Estatísticas em tempo real
- ✅ Alertas contextuais
- ✅ Navegação para outras telas

### 📊 Tela de Histórico (HistoryPage)
- ✅ 3 gráficos interativos (Recharts):
  - Consumo de água (área)
  - Energia e custo (barras)
  - Consumo por hora (linha)
- ✅ Cards de resumo com estatísticas
- ✅ Seletor de período (7/30/90 dias)
- ✅ Botão de geração de PDF (placeholder)
- ✅ Insights automáticos
- ✅ Atalho para chatbot
- ✅ Design responsivo

### 💬 Tela de Chatbot (ChatPage)
- ✅ Interface de chat completa
- ✅ Respostas inteligentes simuladas
- ✅ Perguntas rápidas
- ✅ Histórico de conversa
- ✅ Indicador de digitação
- ✅ Avatares personalizados
- ✅ Scroll automático
- ✅ Limpar histórico
- ✅ Animações suaves

---

## 🎨 Detalhes Técnicos:

### Navegação

A navegação é gerenciada por estado no `App.tsx`:

```typescript
const [currentPage, setCurrentPage] = useState<PageType>('home');
```

Cada página recebe a função `onNavigate` para trocar de tela:

```typescript
<HomePage onNavigate={setCurrentPage} />
```

### Dados Mockados

Todos os dados são mockados/simulados:
- ✅ Dados de gráficos (7 dias de histórico)
- ✅ Respostas do chatbot IA
- ✅ Estatísticas e insights

**Futuramente:** Integre com Firebase/API real.

### Gráficos

Usa a biblioteca **Recharts** para gráficos responsivos:
- `AreaChart` - Consumo de água
- `BarChart` - Energia e custo
- `LineChart` - Consumo por hora

### Chatbot

A lógica de resposta está na função `generateAIResponse()`:
- Detecta palavras-chave na pergunta
- Retorna respostas contextualizadas
- **Futuramente:** Integre com OpenAI, Gemini, etc.

---

## 🎯 Estrutura de Arquivos Atualizada:

```
~/Projetos/tcc/
├── App.tsx                    ⚠️ SUBSTITUIR
├── pages/                     📁 NOVA PASTA
│   ├── HomePage.tsx           ✨ NOVO
│   ├── HistoryPage.tsx        ✨ NOVO
│   └── ChatPage.tsx           ✨ NOVO
├── components/
│   ├── WaterTankVisualization.tsx
│   ├── SensorStatus.tsx
│   ├── PumpControl.tsx
│   ├── ... (outros componentes)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx         ⚠️ Verificar se existe
│       ├── tabs.tsx          ⚠️ Verificar se existe
│       └── ...
├── hooks/
│   └── useWaterSystem.ts
└── types/
    └── water-system.ts
```

---

## 🧪 Testar:

```bash
npm run dev
```

ou

```bash
ionic serve
```

### Navegação:
1. **Tela Principal** → Clique em "Histórico" ou "Assistente IA"
2. **Tela de Histórico** → Explore gráficos, mude períodos, clique em "Abrir Chat"
3. **Tela de Chat** → Faça perguntas, use perguntas rápidas
4. Todas as telas têm botão de voltar (←)

---

## 🔧 Personalizações Futuras:

### Integrar com Firebase:
```typescript
// Em HistoryPage.tsx
useEffect(() => {
  // Buscar dados reais do Firebase
  const unsubscribe = onSnapshot(collection(db, "waterHistory"), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    setWaterConsumptionData(data);
  });
  return () => unsubscribe();
}, []);
```

### Integrar com IA Real:
```typescript
// Em ChatPage.tsx
const generateAIResponse = async (userMessage: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

### Gerar PDF Real:
```typescript
// Em HistoryPage.tsx
import jsPDF from 'jspdf';

const handleGeneratePDF = () => {
  const doc = new jsPDF();
  doc.text('Relatório AquaMonitor', 10, 10);
  // Adicionar gráficos, dados, etc.
  doc.save('relatorio-aquamonitor.pdf');
};
```

---

## ✅ Checklist:

- [ ] Instalei `recharts`
- [ ] Copiei `HomePage.tsx`
- [ ] Copiei `HistoryPage.tsx`
- [ ] Copiei `ChatPage.tsx`
- [ ] Substituí `App.tsx`
- [ ] Verifiquei componentes UI (input, tabs)
- [ ] Testei navegação entre telas
- [ ] Testei gráficos na tela de histórico
- [ ] Testei chatbot e perguntas rápidas

---

## 🎉 Pronto!

Agora você tem as 3 telas completas e funcionais:
1. ✅ Tela Principal - Monitoramento em tempo real
2. ✅ Tela de Histórico - Gráficos e estatísticas
3. ✅ Tela de Chatbot - Assistente IA

**Próximos passos:**
- Integrar com Firebase real
- Conectar chatbot com LLM
- Implementar geração de PDF
- Adicionar mais gráficos/insights

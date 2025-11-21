# Estrutura de Telas - AquaMonitor TCC

Este documento sugere a organização de informações entre as 3 telas do aplicativo.

## 📱 Tela 1: Principal (Dashboard) - ✅ IMPLEMENTADA

**Objetivo**: Monitoramento em tempo real e controle imediato do sistema

### Elementos Presentes:
1. **Header**
   - Logo e nome do app (AquaMonitor)
   - Indicação visual do sistema ativo

2. **Alertas de Nível**
   - Alerta crítico quando < 30%
   - Alerta de tanque cheio quando ≥ 90%

3. **Estatísticas Rápidas** (3 cards horizontais)
   - Volume atual em litros
   - Status da bomba (ligada/desligada)
   - Consumo diário

4. **Visualização do Tanque**
   - Recipiente cilíndrico 3D
   - Animação do nível de água
   - Cores que mudam conforme o nível
   - Marcações de porcentagem

5. **Status do Último Sensor**
   - Nome do sensor
   - Ação (subiu/desceu)
   - Horário da mudança

6. **Controle da Bomba**
   - Botão ON/OFF grande e visual
   - Feedback de cor (verde/cinza)

7. **Modo de Acionamento**
   - Badge colorido indicando modo atual
   - Descrição do modo

8. **Estimativa de Consumo Energético**
   - Tempo ligada
   - Energia em kWh
   - Custo estimado em R$
   - Potência da bomba

9. **Navegação Inferior**
   - Botões para Histórico e Chatbot IA

10. **Status de Conexão**
    - Indicadores Firebase e MQTT

---

## 📊 Tela 2: Histórico e Estatísticas

**Objetivo**: Análise de dados históricos e geração de relatórios

### Sugestão de Estrutura:

#### Seção 1: Filtros de Período
```
┌─────────────────────────────────┐
│ [Hoje] [Semana] [Mês] [Custom] │
│ De: [__/__/__] Até: [__/__/__] │
└─────────────────────────────────┘
```

#### Seção 2: Gráficos Principais

**Gráfico 1: Nível de Água ao Longo do Tempo**
- Tipo: Gráfico de área (Recharts)
- Eixo X: Tempo (horas/dias)
- Eixo Y: Porcentagem (0-100%)
- Cores: Gradiente azul
- Marcações: Linhas em 25%, 50%, 75%, 100%

**Gráfico 2: Acionamentos da Bomba**
- Tipo: Gráfico de barras
- Eixo X: Dias
- Eixo Y: Número de acionamentos
- Cores diferentes por modo (automático/manual mqtt/manual chave)
- Legenda explicativa

**Gráfico 3: Consumo de Energia**
- Tipo: Gráfico de linha
- Eixo X: Dias
- Eixo Y: kWh
- Segunda linha: Custo em R$
- Totalizador do período

**Gráfico 4: Consumo de Água**
- Tipo: Gráfico de pizza ou rosca
- Distribuição por períodos do dia
- Total em litros

#### Seção 3: Estatísticas do Período

```
┌─────────────────────┬─────────────────────┐
│ Total de Água       │ 45.230 L            │
├─────────────────────┼─────────────────────┤
│ Acionamentos        │ 127 vezes           │
├─────────────────────┼─────────────────────┤
│ Tempo Bomba Ligada  │ 18h 45min           │
├─────────────────────┼─────────────────────┤
│ Energia Consumida   │ 23.4 kWh            │
├─────────────────────┼─────────────────────┤
│ Custo Estimado      │ R$ 15,35            │
├─────────────────────┼─────────────────────┤
│ Média Diária        │ 1.508 L/dia         │
└─────────────────────┴─────────────────────┘
```

#### Seção 4: Eventos e Alertas
- Lista de eventos importantes no período
- Falhas/problemas detectados
- Tempo de resposta dos sensores
- Picos de consumo anormais

#### Seção 5: Campo de Chatbot (Preview)
```
┌──────────────────────────────────────┐
│  🤖 Assistente IA                    │
│  ┌────────────────────────────────┐  │
│  │ Olá! Posso te ajudar a         │  │
│  │ analisar os dados do sistema.  │  │
│  │ Toque para conversar comigo → │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```
- Clique abre a Tela 3

#### Seção 6: Geração de Relatórios
```
┌──────────────────────────────────────┐
│ 📄 Gerar Relatório                   │
│                                      │
│ Período: [De _____ até _____]       │
│                                      │
│ Incluir:                             │
│ ☑ Gráficos                          │
│ ☑ Estatísticas detalhadas           │
│ ☑ Lista de eventos                  │
│ ☑ Análise de consumo                │
│                                      │
│ [ Gerar PDF ] [ Compartilhar ]      │
└──────────────────────────────────────┘
```

### Tecnologias Sugeridas:
- **Gráficos**: Recharts (já disponível)
- **PDF**: react-pdf ou jsPDF
- **Date Picker**: Componente Calendar do ShadCN
- **Filtros**: Tabs e Select do ShadCN

---

## 💬 Tela 3: Chatbot IA

**Objetivo**: Interação com assistente virtual para análise e suporte

### Sugestão de Estrutura:

#### Header do Chat
```
┌─────────────────────────────────────┐
│ ← AquaBot IA               [ ⋮ ]   │
│ Online • Respondendo                │
└─────────────────────────────────────┘
```

#### Área de Mensagens
```
┌─────────────────────────────────────┐
│                                     │
│  ┌────────────────────────────┐    │
│  │ Olá! Sou o AquaBot.        │    │
│  │ Como posso ajudar?         │    │
│  └────────────────────────────┘    │
│  🤖                         14:30   │
│                                     │
│              ┌──────────────────┐   │
│              │ Qual o consumo   │   │
│              │ de água hoje?    │   │
│              └──────────────────┘   │
│         14:31                    👤 │
│                                     │
│  ┌────────────────────────────┐    │
│  │ Hoje você consumiu 1.250L  │    │
│  │ de água. Isso representa   │    │
│  │ uma redução de 15% em      │    │
│  │ relação à média semanal!   │    │
│  │                            │    │
│  │ [Ver Gráfico]              │    │
│  └────────────────────────────┘    │
│  🤖                         14:31   │
│                                     │
│  ⋮                                 │
│                                     │
└─────────────────────────────────────┘
```

#### Input de Mensagem
```
┌─────────────────────────────────────┐
│ [+] Digite sua mensagem...    [⬆]  │
└─────────────────────────────────────┘
```

### Funcionalidades do Chatbot:

1. **Perguntas Frequentes (Mockadas inicialmente)**
   - "Qual o consumo de água hoje?"
   - "Quanto gastei de energia este mês?"
   - "Quantas vezes a bomba foi acionada?"
   - "Mostre o gráfico de nível de água"
   - "Há algum problema detectado?"

2. **Sugestões Rápidas** (Chips/Botões)
   ```
   [ 📊 Ver estatísticas ] [ 💡 Dicas de economia ]
   [ ⚡ Status da bomba  ] [ 📈 Tendências        ]
   ```

3. **Comandos de Voz** (futuro)
   - Botão de microfone no input
   - Transcrição de voz para texto

4. **Ações Rápidas via Chat**
   - "Ligar a bomba"
   - "Desligar a bomba"
   - "Mudar para modo automático"
   - Confirmação antes de executar

5. **Análises e Insights**
   - Detecção de padrões de consumo
   - Alertas de anomalias
   - Sugestões de otimização
   - Comparação com períodos anteriores

### Mockup de Respostas (Antes da LLM):

```typescript
const mockResponses = {
  "consumo": "Hoje você consumiu 1.250L de água. A média dos últimos 7 dias é 1.470L.",
  "energia": "O consumo de energia neste mês foi de 23.4 kWh, custando aproximadamente R$ 15,35.",
  "bomba": "A bomba foi acionada 12 vezes hoje, totalizando 3h 45min ligada.",
  "problema": "Nenhum problema detectado. O sistema está funcionando normalmente.",
  "nivel": "O nível atual do reservatório é 75%, com 3.750 litros de água."
};
```

### Interface com IA Real (Futuro):

```typescript
// Exemplo de integração com OpenAI/Anthropic
const sendMessage = async (message: string) => {
  const context = {
    waterLevel: 75,
    isPumpOn: false,
    dailyUsage: 1250,
    energyConsumed: 2.8,
    // ... outros dados do sistema
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      context,
      history: chatHistory
    })
  });

  return response.json();
};
```

### Design do Chat:
- Mensagens do bot: Fundo azul claro, alinhadas à esquerda
- Mensagens do usuário: Fundo cinza, alinhadas à direita
- Avatares: 🤖 para bot, 👤 para usuário
- Timestamp em cada mensagem
- Indicador de "digitando..." quando aguardando resposta
- Scroll automático para última mensagem

---

## 🔄 Fluxo de Navegação

```
Tela 1 (Principal)
    │
    ├─── Botão "Histórico" ──→ Tela 2
    │                             │
    │                             └─── Preview Chatbot ──→ Tela 3
    │
    └─── Botão "Assistente IA" ──→ Tela 3
                                      │
                                      └─── Botão "Voltar" ──→ Tela 1
```

---

## 📐 Layout Responsivo

Todas as telas devem:
- Funcionar bem em telas de 320px a 768px de largura
- Usar grid responsivo (grid-cols-1 em mobile, grid-cols-2 ou mais em tablet)
- Manter espaçamento adequado (px-4, py-6)
- Ter áreas de toque grandes (min 44x44px)
- Suportar orientação portrait e landscape

---

## 🎨 Paleta de Cores Sugerida

**Cores Principais:**
- Azul primário: #2563eb (blue-600)
- Azul secundário: #3b82f6 (blue-500)
- Verde sucesso: #16a34a (green-600)
- Vermelho alerta: #dc2626 (red-600)
- Laranja aviso: #ea580c (orange-600)

**Backgrounds:**
- Fundo principal: #f8fafc (slate-50)
- Cards: #ffffff (white)
- Gradientes: blue-600 to blue-700

**Textos:**
- Primário: #1e293b (slate-800)
- Secundário: #64748b (slate-600)
- Terciário: #94a3b8 (slate-400)

---

## 🚀 Ordem de Implementação Recomendada

1. ✅ **Tela 1** - CONCLUÍDA
2. **Tela 2 - Histórico** (Próximo passo)
   - Criar componentes de gráficos
   - Implementar filtros de data
   - Mockear dados históricos
   - Geração de PDF
3. **Tela 3 - Chatbot** (Último)
   - Interface de chat
   - Sistema de mock responses
   - Preparar para integração com LLM

---

## 📝 Notas Importantes

- Mantenha consistência visual entre as telas
- Use os mesmos componentes do ShadCN quando possível
- Implemente loading states em todos os lugares
- Adicione animações sutis com Motion
- Teste em diferentes tamanhos de tela
- Considere modo offline (dados em cache)

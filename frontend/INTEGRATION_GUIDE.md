# Guia de Integração - AquaMonitor TCC

Este documento descreve como integrar a interface com Firebase e MQTT.

## Estrutura Atual

A aplicação está organizada da seguinte forma:

- **`/App.tsx`** - Tela principal que exibe todos os componentes
- **`/components/`** - Componentes reutilizáveis da interface
- **`/hooks/useWaterSystem.ts`** - Hook customizado que gerencia o estado do sistema
- **`/types/water-system.ts`** - Tipos TypeScript para os dados do sistema

## Componentes Criados

### 1. WaterTankVisualization
Visualização 3D do reservatório de água com animação.
- Props: `waterLevel` (0-100)
- Atualiza automaticamente com animação suave

### 2. SensorStatus
Exibe o último sensor que mudou de estado.
- Props: `sensorName`, `action` ("subiu" | "desceu"), `time`

### 3. PumpControl
Botão de controle da bomba com feedback visual.
- Props: `isOn`, `onToggle`
- Cores mudam conforme o estado

### 4. PumpModeDisplay
Mostra o modo de acionamento atual da bomba.
- Props: `mode` ("automático" | "manual mqtt" | "manual chave")

### 5. EnergyEstimate
Calcula e exibe estimativa de consumo energético.
- Props: `isPumpOn`, `pumpPowerWatts` (opcional, padrão 750W)
- Calcula automaticamente kWh e custo

## Integração com Firebase

### Passo 1: Configurar Firebase
```typescript
// Em /services/firestoreConfig.ts (já deve existir)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  // ... outras configs
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Passo 2: Estrutura de Dados no Firestore
Coleção: `waterSystem`
Documento: `current`

```json
{
  "waterLevel": 75,
  "pumpState": {
    "isOn": false,
    "mode": "automático"
  },
  "lastSensor": {
    "name": "Sensor Nível Alto",
    "action": "subiu",
    "time": "14:32:15"
  },
  "energyData": {
    "totalMinutes": 120,
    "sessionStart": null
  }
}
```

### Passo 3: Atualizar o Hook useWaterSystem

Descomentar e implementar as seções marcadas com `// TODO:` no arquivo `/hooks/useWaterSystem.ts`:

```typescript
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../services/firestoreConfig';

// Dentro do useEffect para Firebase:
const unsubscribe = onSnapshot(doc(db, "waterSystem", "current"), (doc) => {
  const data = doc.data() as FirebaseWaterData;
  setWaterLevel(data.waterLevel);
  setIsPumpOn(data.pumpState.isOn);
  setPumpMode(data.pumpState.mode);
  setLastSensor(data.lastSensor);
  setIsConnected(prev => ({ ...prev, firebase: true }));
});

return () => unsubscribe();
```

## Integração com MQTT

### Passo 1: Instalar biblioteca MQTT
```bash
npm install mqtt
```

### Passo 2: Configurar Cliente MQTT
```typescript
// Em /services/mqttService.ts (já deve existir)
import mqtt from 'mqtt';

const MQTT_BROKER_URL = 'ws://seu-broker-mqtt.com:8083/mqtt';

export const connectMQTT = () => {
  const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `aquamonitor_${Math.random().toString(16).slice(3)}`,
    username: 'seu_usuario', // se necessário
    password: 'sua_senha'    // se necessário
  });

  return client;
};
```

### Passo 3: Tópicos MQTT

**Subscrições (receber dados):**
- `water-system/sensors` - Mudanças nos sensores
- `water-system/pump` - Estado da bomba
- `water-system/level` - Nível de água

**Publicações (enviar comandos):**
- `water-system/commands` - Comandos de controle

**Formato das mensagens:**
```json
{
  "type": "pump_toggle",
  "value": true,
  "timestamp": 1698765432000
}
```

### Passo 4: Implementar no Hook

```typescript
useEffect(() => {
  const client = connectMQTT();
  
  client.on('connect', () => {
    console.log('MQTT conectado');
    setIsConnected(prev => ({ ...prev, mqtt: true }));
    
    client.subscribe('water-system/sensors');
    client.subscribe('water-system/pump');
    client.subscribe('water-system/level');
  });
  
  client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    
    switch(topic) {
      case 'water-system/level':
        setWaterLevel(data.level);
        break;
      case 'water-system/pump':
        setIsPumpOn(data.isOn);
        setPumpMode(data.mode);
        break;
      case 'water-system/sensors':
        setLastSensor(data);
        break;
    }
  });
  
  client.on('error', (err) => {
    console.error('Erro MQTT:', err);
    setIsConnected(prev => ({ ...prev, mqtt: false }));
  });
  
  return () => client.end();
}, []);
```

## Lógica de Sensores Automática

A lógica atual simula o comportamento dos sensores:

- **Sensor Nível Baixo (≤25%)**: Liga a bomba automaticamente (modo automático)
- **Sensor Nível Alto (≥95%)**: Desliga a bomba automaticamente (modo automático)

Para implementar com dados reais:
1. Remover a simulação no `useEffect` de mudanças automáticas
2. Deixar apenas os listeners do Firebase/MQTT atualizarem o estado
3. A lógica dos sensores deve rodar no hardware/backend

## Estimativa de Energia

O componente `EnergyEstimate` calcula:
- Tempo total que a bomba ficou ligada
- Consumo em kWh (baseado na potência do fabricante)
- Custo estimado (R$ 0,656/kWh - média Brasil)

Para persistir esses dados:
1. Salvar `totalMinutes` no Firebase quando a bomba desligar
2. Recuperar ao iniciar o app
3. Considerar criar um histórico diário/mensal

## Próximos Passos

### Tela 2: Histórico e Estatísticas
- Gráficos de consumo de água ao longo do tempo (usar Recharts)
- Gráficos de energia consumida
- Campo de chatbot (placeholder)
- Geração de relatórios em PDF

### Tela 3: Chatbot com IA
- Interface de chat completa
- Integração com LLM futura
- Histórico de conversas

## Dicas de Implementação

1. **Teste incrementalmente**: Conecte primeiro o Firebase, depois o MQTT
2. **Use o console do navegador**: Todos os logs estão configurados
3. **Mantenha os mocks**: São úteis para desenvolvimento offline
4. **Tratamento de erros**: Adicione try-catch nas operações assíncronas
5. **Loading states**: Considere adicionar skeletons enquanto carrega dados

## Exemplo de Integração Completa

Veja o arquivo `/hooks/useWaterSystem.ts` - todas as seções marcadas com `// TODO:` mostram onde integrar Firebase e MQTT.

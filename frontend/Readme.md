# 🚰 AquaMonitor - Instalação no Ionic

## ⚡ INSTALAÇÃO RÁPIDA

### 1️⃣ Instalar Dependências

```bash
cd ~/Projetos/tcc/
npm install motion lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-alert-dialog tailwindcss@next @tailwindcss/vite@next
```

### 2️⃣ Copiar Arquivos

Baixe/copie os seguintes arquivos deste ambiente Figma Make para seu projeto:

#### Componentes (8 arquivos)
```
/src/components/*.tsx  →  ~/Projetos/tcc/src/components/
```

#### UI Components (toda a pasta)
```
/components/ui/  →  ~/Projetos/tcc/src/components/ui/
```

#### Outros arquivos
```
/src/hooks/useWaterSystem.ts  →  ~/Projetos/tcc/src/hooks/
/src/types/water-system.ts    →  ~/Projetos/tcc/src/types/
/src/pages/Home.tsx           →  ~/Projetos/tcc/src/pages/ (substituir)
/src/App.tsx                  →  ~/Projetos/tcc/src/App.tsx (substituir)
/src/theme/tailwind.css       →  ~/Projetos/tcc/src/theme/
```

### 3️⃣ Modificar Arquivos

**A) ~/Projetos/tcc/src/main.tsx**

Adicione no topo:
```typescript
import './theme/tailwind.css';
```

**B) ~/Projetos/tcc/vite.config.ts**

Adicione:
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← adicionar
    // ... outros plugins
  ],
});
```

### 4️⃣ Testar

```bash
ionic serve
```

---

## 📚 Documentação Detalhada

- **LEIA_ISSO_PRIMEIRO.md** - Guia visual passo a passo
- **COMO_USAR.txt** - Instruções em texto simples
- **INSTALACAO_IONIC.md** - Guia detalhado de instalação
- **ESTRUTURA_COMPLETA.md** - Estrutura de arquivos explicada

---

## 🆘 Problemas?

Veja **LEIA_ISSO_PRIMEIRO.md** para troubleshooting detalhado.

---

## ✨ Funcionalidades Implementadas

- ✅ Visualização 3D animada do tanque
- ✅ Controle ON/OFF da bomba
- ✅ Indicador de modo de acionamento
- ✅ Estimativa de consumo energético
- ✅ Alertas contextuais de nível
- ✅ Estatísticas rápidas
- ✅ Status de sensores
- ✅ Indicadores de conexão Firebase/MQTT
- ✅ Design responsivo para mobile
- ✅ Interface Ionic completa

---

## 🔜 Próximos Passos

1. Integrar com Firebase real (substitua os TODOs no hook)
2. Conectar ao MQTT (substitua os TODOs no hook)
3. Implementar tela de histórico/estatísticas
4. Implementar chatbot IA
5. Gerar relatórios PDF

---

**Desenvolvido para TCC - Sistema de Monitoramento de Água em Condomínios**

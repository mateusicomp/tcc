import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { HelpCircle, Droplets, Power, Zap, BarChart3 } from "lucide-react";
import { Card } from "./ui/card";

export function QuickHelp() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-20 right-4 bg-white shadow-lg rounded-full z-50"
        >
          <HelpCircle className="w-5 h-5 text-blue-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Guia Rápido</SheetTitle>
          <SheetDescription>
            Aprenda a usar o AquaMonitor
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Seção 1 */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-2">Nível de Água</h3>
                <p className="text-sm text-slate-600">
                  O cilindro mostra o nível atual do reservatório. A cor muda conforme a quantidade:
                </p>
                <ul className="text-xs text-slate-500 mt-2 space-y-1">
                  <li>• <span className="text-blue-600">Azul</span>: Nível bom (≥75%)</li>
                  <li>• <span className="text-cyan-600">Ciano</span>: Nível médio (50-74%)</li>
                  <li>• <span className="text-orange-600">Laranja</span>: Nível baixo (25-49%)</li>
                  <li>• <span className="text-red-600">Vermelho</span>: Nível crítico (&lt;25%)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Seção 2 */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Power className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="mb-2">Controle da Bomba</h3>
                <p className="text-sm text-slate-600">
                  Toque no botão para ligar/desligar a bomba manualmente.
                </p>
                <ul className="text-xs text-slate-500 mt-2 space-y-1">
                  <li>• <span className="text-green-600">Verde</span>: Bomba ligada</li>
                  <li>• <span className="text-slate-400">Cinza</span>: Bomba desligada</li>
                </ul>
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Ao ligar manualmente, o modo muda para "Manual MQTT"
                </p>
              </div>
            </div>
          </Card>

          {/* Seção 3 */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-2">Modos de Acionamento</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>
                    <span className="text-blue-600">🤖 Automático:</span> 
                    <span className="text-xs ml-1">A bomba liga/desliga com base nos sensores</span>
                  </li>
                  <li>
                    <span className="text-purple-600">📱 Manual MQTT:</span> 
                    <span className="text-xs ml-1">Acionada pelo app</span>
                  </li>
                  <li>
                    <span className="text-amber-600">🔧 Manual Chave:</span> 
                    <span className="text-xs ml-1">Acionada fisicamente</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Seção 4 */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="mb-2">Consumo de Energia</h3>
                <p className="text-sm text-slate-600">
                  Acompanhe quanto a bomba está consumindo em tempo real.
                </p>
                <ul className="text-xs text-slate-500 mt-2 space-y-1">
                  <li>• Tempo ligada (horas e minutos)</li>
                  <li>• Energia consumida (kWh)</li>
                  <li>• Custo estimado (R$)</li>
                </ul>
                <p className="text-xs text-slate-400 mt-2">
                  Baseado em 750W (potência do fabricante) e R$ 0,656/kWh
                </p>
              </div>
            </div>
          </Card>

          {/* Seção 5 */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="mb-2">Histórico e IA</h3>
                <p className="text-sm text-slate-600">
                  Use os botões na parte inferior para:
                </p>
                <ul className="text-xs text-slate-500 mt-2 space-y-1">
                  <li>• Ver gráficos e estatísticas</li>
                  <li>• Gerar relatórios em PDF</li>
                  <li>• Conversar com o assistente IA</li>
                </ul>
                <p className="text-xs text-amber-600 mt-2">
                  🚧 Em desenvolvimento
                </p>
              </div>
            </div>
          </Card>

          {/* Info adicional */}
          <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600">
            <p className="mb-2">
              <span className="text-green-600">●</span> Indicadores verdes na parte inferior mostram conexão ativa com Firebase e MQTT.
            </p>
            <p>
              <span className="text-red-600">●</span> Indicadores vermelhos indicam perda de conexão.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

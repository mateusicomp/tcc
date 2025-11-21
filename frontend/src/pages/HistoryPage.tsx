import { useState } from "react";
import { useHistory } from "react-router-dom";
import { 
  ArrowLeft, Download, Calendar, TrendingDown,
  TrendingUp, Droplets, Zap,MessageSquare,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";


// Dados mockados para os gráficos
const waterConsumptionData = [
  { date: "01/10", consumption: 4200, level: 85 },
  { date: "02/10", consumption: 4500, level: 78 },
  { date: "03/10", consumption: 3800, level: 82 },
  { date: "04/10", consumption: 5100, level: 72 },
  { date: "05/10", consumption: 4800, level: 75 },
  { date: "06/10", consumption: 4300, level: 80 },
  { date: "07/10", consumption: 3900, level: 83 },
];

const energyData = [
  { date: "01/10", energy: 2.5, cost: 1.64 },
  { date: "02/10", energy: 3.1, cost: 2.03 },
  { date: "03/10", energy: 2.8, cost: 1.84 },
  { date: "04/10", energy: 3.5, cost: 2.3 },
  { date: "05/10", energy: 3.2, cost: 2.1 },
  { date: "06/10", energy: 2.9, cost: 1.9 },
  { date: "07/10", energy: 2.6, cost: 1.71 },
];

const hourlyData = [
  { hour: "00h", usage: 120 },
  { hour: "03h", usage: 80 },
  { hour: "06h", usage: 250 },
  { hour: "09h", usage: 420 },
  { hour: "12h", usage: 580 },
  { hour: "15h", usage: 450 },
  { hour: "18h", usage: 620 },
  { hour: "21h", usage: 380 },
];

export function HistoryPage() {
  const history = useHistory();
  const [selectedPeriod, setSelectedPeriod] = useState<"7days" | "30days" | "90days">("7days");

  // Função para gerar PDF (mock)
  const handleGeneratePDF = () => {
    alert(
      "Gerando relatório PDF...\n\nEsta funcionalidade será implementada com a biblioteca jsPDF ou similar."
    );
  };

  return (
    <>
      {/* Header da página */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          // se seu Button não suporta "size", pode remover a prop e usar classes
          size="icon"
          onClick={() => history.push("/home")}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl text-slate-800">Histórico e Estatísticas</h2>
          <p className="text-sm text-slate-500">Análise de consumo e custos</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleGeneratePDF} className="shrink-0">
          <Download className="w-4 h-4 mr-2" />
          PDF
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <Badge variant="secondary" className="text-xs">
              Média
            </Badge>
          </div>
          <p className="text-2xl text-blue-800 mb-1">4,386L</p>
          <p className="text-xs text-blue-600">Consumo diário</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingDown className="w-3 h-3" />
            <span>-8% vs mês passado</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-start justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <Badge variant="secondary" className="text-xs">
              Total
            </Badge>
          </div>
          <p className="text-2xl text-yellow-800 mb-1">R$ 13,52</p>
          <p className="text-xs text-yellow-600">Custo semanal</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
            <TrendingUp className="w-3 h-3" />
            <span>+5% vs semana passada</span>
          </div>
        </Card>
      </div>

      {/* Seletor de Período */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-700">Período:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={selectedPeriod === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("7days")}
          >
            7 dias
          </Button>
          <Button
            variant={selectedPeriod === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("30days")}
          >
            30 dias
          </Button>
          <Button
            variant={selectedPeriod === "90days" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("90days")}
          >
            90 dias
          </Button>
        </div>
      </Card>

      {/* Tabs com Gráficos */}
      <Tabs defaultValue="water" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="water">Água</TabsTrigger>
          <TabsTrigger value="energy">Energia</TabsTrigger>
          <TabsTrigger value="hourly">Por Hora</TabsTrigger>
        </TabsList>

        {/* Gráfico de Consumo de Água */}
        <TabsContent value="water">
          <Card className="p-4">
            <h3 className="text-sm text-slate-700 mb-4">Consumo de Água (Litros)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={waterConsumptionData}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                <YAxis style={{ fontSize: "12px" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#3b82f6"
                  fill="url(#colorConsumption)"
                  strokeWidth={2}
                  name="Consumo (L)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Gráfico de Energia */}
        <TabsContent value="energy">
          <Card className="p-4">
            <h3 className="text-sm text-slate-700 mb-4">Consumo de Energia e Custo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="left" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="right" orientation="right" style={{ fontSize: "12px" }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="energy" fill="#eab308" name="Energia (kWh)" />
                <Bar yAxisId="right" dataKey="cost" fill="#22c55e" name="Custo (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Gráfico por Hora */}
        <TabsContent value="hourly">
          <Card className="p-4">
            <h3 className="text-sm text-slate-700 mb-4">Consumo por Hora (Hoje)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" style={{ fontSize: "12px" }} />
                <YAxis style={{ fontSize: "12px" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  name="Uso (L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chatbot Placeholder */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-600 rounded-full">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-purple-900 mb-1">Assistente IA</h3>
            <p className="text-xs text-purple-700 mb-3">
              Precisa de ajuda para interpretar os dados? Converse com nosso assistente!
            </p>
            <Button
              variant="default"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => history.push("/chat")}
            >
              Abrir Chat
            </Button>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-4 mt-6 bg-slate-50 border-slate-200">
        <h3 className="text-sm text-slate-700 mb-3">💡 Insights</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 shrink-0">•</span>
            <span>Seu consumo está 8% menor que o mês passado. Continue assim!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 shrink-0">•</span>
            <span>Pico de consumo identificado entre 18h-21h. Considere otimizar o uso neste período.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 shrink-0">•</span>
            <span>A bomba operou eficientemente esta semana, com 12h de uso total.</span>
          </li>
        </ul>
      </Card>
    </>
  );
}

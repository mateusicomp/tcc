import { Card } from "./ui/card";
import { Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface EnergyEstimateProps {
  isPumpOn: boolean;
  pumpPowerWatts?: number; // Potência da bomba em Watts
}

export function EnergyEstimate({ isPumpOn, pumpPowerWatts = 750 }: EnergyEstimateProps) {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPumpOn) {
      if (sessionStart === null) {
        setSessionStart(Date.now());
      }
      
      interval = setInterval(() => {
        if (sessionStart) {
          const elapsed = Math.floor((Date.now() - sessionStart) / 60000);
          setTotalMinutes(prev => prev + (elapsed > 0 ? 1 : 0));
        }
      }, 60000); // Atualiza a cada minuto
    } else {
      if (sessionStart !== null) {
        const elapsed = Math.floor((Date.now() - sessionStart) / 60000);
        if (elapsed > 0) {
          setTotalMinutes(prev => prev + elapsed);
        }
        setSessionStart(null);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPumpOn, sessionStart]);

  // Cálculo de energia: (Potência em W × Tempo em horas) / 1000 = kWh
  const hours = totalMinutes / 60;
  const energyKwh = (pumpPowerWatts * hours) / 1000;
  
  // Estimativa de custo (R$ 0,656 por kWh - média Brasil)
  const costEstimate = energyKwh * 0.656;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-yellow-600" />
        <p className="text-sm text-slate-600">Estimativa de Consumo</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Tempo ligada:</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm">
              {Math.floor(hours)}h {totalMinutes % 60}min
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Energia:</span>
          <span className="text-lg text-blue-600">{energyKwh.toFixed(3)} kWh</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <span className="text-sm text-slate-600">Custo estimado:</span>
          <span className="text-lg text-green-700">
            R$ {costEstimate.toFixed(2)}
          </span>
        </div>
        
        <p className="text-xs text-slate-400 mt-2">
          Baseado em {pumpPowerWatts}W (dados do fabricante)
        </p>
      </div>
    </Card>
  );
}

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Cpu, Smartphone, ToggleRight } from "lucide-react";

interface PumpModeDisplayProps {
  mode: "automático" | "manual mqtt" | "manual chave";
}

export function PumpModeDisplay({ mode }: PumpModeDisplayProps) {
  const getModeConfig = () => {
    switch (mode) {
      case "automático":
        return {
          icon: <Cpu className="w-4 h-4" />,
          color: "bg-blue-600",
          description: "Acionada pela lógica de sensores"
        };
      case "manual mqtt":
        return {
          icon: <Smartphone className="w-4 h-4" />,
          color: "bg-purple-600",
          description: "Acionada por comando MQTT via app"
        };
      case "manual chave":
        return {
          icon: <ToggleRight className="w-4 h-4" />,
          color: "bg-amber-600",
          description: "Acionada por chave física"
        };
    }
  };

  const config = getModeConfig();

  return (
    <Card className="p-4">
      <p className="text-sm text-slate-600 mb-3">Modo de Acionamento</p>
      <div className="flex flex-col gap-2">
        <Badge className={`${config.color} w-fit`}>
          {config.icon}
          <span className="ml-2 capitalize">{mode}</span>
        </Badge>
        <p className="text-xs text-slate-500">{config.description}</p>
      </div>
    </Card>
  );
}

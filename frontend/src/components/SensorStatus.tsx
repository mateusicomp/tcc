import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";

interface SensorStatusProps {
  sensorName: string;
  action: "subiu" | "desceu";
  time: string;
}

export function SensorStatus({ sensorName, action, time }: SensorStatusProps) {
  const isUp = action === "subiu";
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-2">Último Sensor Alterado</p>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant={isUp ? "default" : "secondary"}
              className={isUp ? "bg-green-600" : "bg-orange-600"}
            >
              {isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {sensorName}
            </Badge>
            <span className="text-sm">{action}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

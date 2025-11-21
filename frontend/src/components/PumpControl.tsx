import { Card } from "./ui/card";
import { motion } from "motion/react";
import { Power } from "lucide-react";

interface PumpControlProps {
  isOn: boolean;
  onToggle: () => void;
}

export function PumpControl({ isOn, onToggle }: PumpControlProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-slate-600 mb-3">Controle da Bomba</p>
      <motion.button
        className={`w-full py-6 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
          isOn 
            ? "bg-green-600 text-white" 
            : "bg-slate-300 text-slate-700"
        }`}
        onClick={onToggle}
        whileTap={{ scale: 0.95 }}
      >
        <Power className="w-8 h-8" />
        <span className="text-xl">{isOn ? "ON" : "OFF"}</span>
      </motion.button>
    </Card>
  );
}

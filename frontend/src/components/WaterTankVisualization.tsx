import { motion } from "motion/react";

interface WaterTankVisualizationProps {
  waterLevel: number; // 0-100
}

export function WaterTankVisualization({ waterLevel }: WaterTankVisualizationProps) {
  const getWaterColor = () => {
    if (waterLevel >= 75) return "from-blue-400 to-blue-600";
    if (waterLevel >= 50) return "from-cyan-400 to-blue-500";
    if (waterLevel >= 25) return "from-yellow-300 to-orange-400";
    return "from-red-400 to-red-600";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-64">
        {/* Cilindro - Parte superior (elipse) */}
        <div className="absolute top-0 left-0 w-full h-12 rounded-[50%] bg-gradient-to-b from-slate-300 to-slate-400 border-2 border-slate-500 z-10 shadow-lg" />
        
        {/* Corpo do cilindro */}
        <div className="absolute top-6 left-0 w-full h-52 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 border-l-2 border-r-2 border-slate-500 shadow-inner" />
        
        {/* Água */}
        <div className="absolute top-6 left-0 w-full h-52 overflow-hidden">
          <motion.div
            className={`absolute bottom-0 left-0 w-full bg-gradient-to-b ${getWaterColor()}`}
            initial={{ height: "0%" }}
            animate={{ height: `${(waterLevel / 100) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* Efeito de ondas na superfície */}
            <div className="absolute top-0 left-0 w-full h-3 bg-white opacity-30 rounded-[50%] animate-pulse" />
            {/* Reflexo lateral */}
            <div className="absolute top-0 left-0 w-4 h-full bg-white opacity-20" />
          </motion.div>
        </div>
        
        {/* Cilindro - Parte inferior (elipse) */}
        <div className="absolute bottom-0 left-0 w-full h-12 rounded-[50%] bg-gradient-to-t from-slate-500 to-slate-400 border-2 border-slate-500 shadow-lg" />
        
        {/* Marcações de nível */}
        <div className="absolute top-6 -left-10 h-52 flex flex-col justify-between text-xs text-slate-600">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        
        {/* Linhas de marcação */}
        <div className="absolute top-6 left-0 w-full h-52 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-slate-300 border-dashed opacity-50" />
          ))}
        </div>
      </div>
      
      {/* Porcentagem */}
      <motion.div
        className="px-6 py-3 bg-blue-600 text-white rounded-full"
        key={waterLevel}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-2xl">{waterLevel}%</span>
      </motion.div>
    </div>
  );
}

'use client';

import { cn } from "@/utils/cn";

interface CompareStatRowProps {
  label: string;
  val1: string | number;
  val2: string | number;
  unit?: string;
  higherIsBetter?: boolean;
}

export default function CompareStatRow({ 
  label, 
  val1, 
  val2, 
  unit = "", 
  higherIsBetter = true 
}: CompareStatRowProps) {
  const num1 = typeof val1 === 'string' ? parseFloat(val1) : val1;
  const num2 = typeof val2 === 'string' ? parseFloat(val2) : val2;

  const isVal1Better = higherIsBetter ? num1 > num2 : num1 < num2;
  const isVal2Better = higherIsBetter ? num2 > num1 : num2 < num1;
  const isEqual = num1 === num2;

  return (
    <div className="group space-y-2 mb-6 last:mb-0">
      <div className="flex justify-between items-center px-1">
         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Value 1 */}
        <div className="flex-1 text-left">
          <p className={cn(
            "text-2xl font-black italic transition-all duration-500",
            isVal1Better ? "text-win scale-110" : isEqual ? "text-white" : "text-gray-600"
          )}>
            {val1}{unit}
          </p>
        </div>

        {/* Visual Bar */}
        <div className="flex-[2] h-2 bg-white/5 rounded-full overflow-hidden flex relative">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              isVal1Better ? "bg-win" : "bg-white/10"
            )}
            style={{ width: `${(num1 / (num1 + num2 || 1)) * 100}%` }}
          />
          <div className="w-px h-full bg-black/40 z-10" />
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              isVal2Better ? "bg-win" : "bg-white/10"
            )}
            style={{ width: `${(num2 / (num1 + num2 || 1)) * 100}%` }}
          />
        </div>

        {/* Value 2 */}
        <div className="flex-1 text-right">
          <p className={cn(
            "text-2xl font-black italic transition-all duration-500",
            isVal2Better ? "text-win scale-110" : isEqual ? "text-white" : "text-gray-600"
          )}>
            {val2}{unit}
          </p>
        </div>
      </div>
    </div>
  );
}

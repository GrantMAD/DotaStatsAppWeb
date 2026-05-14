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

  const total = (num1 + num2) || 1;
  const perc1 = (num1 / total) * 100;
  const perc2 = (num2 / total) * 100;

  const diff = Math.abs(num1 - num2);
  const diffFormatted = Number.isInteger(diff) ? diff : diff.toFixed(1);

  return (
    <div className="group space-y-3 mb-8 last:mb-0">
      <div className="flex flex-col items-center">
         <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-1">{label}</span>
         {!isEqual && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter text-win/60">
              {isVal1Better ? "← " : ""}{diffFormatted}{unit} Difference{isVal2Better ? " →" : ""}
            </span>
         )}
      </div>
      
      <div className="flex items-center gap-2 relative h-16">
        {/* Left Player Container */}
        <div className={cn(
          "flex-1 h-full relative overflow-hidden rounded-xl border transition-all duration-500 flex items-center justify-end px-6",
          isVal1Better ? "border-win/30 bg-win/5" : "border-white/5 bg-white/2"
        )}>
          {/* Differential Fill - Animates from right (center) to left */}
          <div 
            className={cn(
              "absolute right-0 top-0 bottom-0 transition-all duration-1000 ease-out",
              isVal1Better ? "bg-win/20" : "bg-white/5"
            )}
            style={{ width: `${perc1}%` }}
          />
          
          <div className="relative z-10 flex flex-col items-end">
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-2xl font-black italic transition-all duration-500",
                isVal1Better ? "text-win scale-110" : isEqual ? "text-white" : "text-foreground/40"
              )}>
                {val1}{unit}
              </p>
              {isVal1Better && (
                <span className="bg-win text-[8px] font-black px-1.5 py-0.5 rounded text-black uppercase">Lead</span>
              )}
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="w-10 flex flex-col items-center justify-center z-20">
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] font-black italic text-foreground/20 my-1">VS</span>
          <div className="w-px h-4 bg-white/10" />
        </div>

        {/* Right Player Container */}
        <div className={cn(
          "flex-1 h-full relative overflow-hidden rounded-xl border transition-all duration-500 flex items-center justify-start px-6",
          isVal2Better ? "border-win/30 bg-win/5" : "border-white/5 bg-white/2"
        )}>
          {/* Differential Fill - Animates from left (center) to right */}
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out",
              isVal2Better ? "bg-win/20" : "bg-white/5"
            )}
            style={{ width: `${perc2}%` }}
          />
          
          <div className="relative z-10 flex flex-col items-start">
            <div className="flex items-center gap-2">
              {isVal2Better && (
                <span className="bg-win text-[8px] font-black px-1.5 py-0.5 rounded text-black uppercase">Lead</span>
              )}
              <p className={cn(
                "text-2xl font-black italic transition-all duration-500",
                isVal2Better ? "text-win scale-110" : isEqual ? "text-white" : "text-foreground/40"
              )}>
                {val2}{unit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

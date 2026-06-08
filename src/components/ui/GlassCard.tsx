import { cn } from "@/utils/cn";
import { AnimationWrapper } from "./AnimationWrapper";

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationIteration' | 'onAnimationEnd'> {
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = false, ...props }: GlassCardProps) {
  return (
    <AnimationWrapper 
      animationType={hoverable ? "scale-hover" : "fade-in"}
      className={cn(
        "glass-card p-6",
        hoverable && "glass-card-hover",
        className
      )} 
      {...props}
    >
      {children}
    </AnimationWrapper>
  );
}

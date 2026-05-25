import { cn } from "@/utils/cn";
import { AnimationWrapper } from "./AnimationWrapper";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = false, ...props }: GlassCardProps) {
  // Omit HTML animation events to avoid conflict with motion animation events
  const { onAnimationStart, onAnimationIteration, onAnimationEnd, ...filteredProps } = props as any;

  return (
    <AnimationWrapper 
      animationType={hoverable ? "scale-hover" : "fade-in"}
      className={cn(
        "glass-card p-6",
        hoverable && "glass-card-hover",
        className
      )} 
      {...filteredProps}
    >
      {children}
    </AnimationWrapper>
  );
}

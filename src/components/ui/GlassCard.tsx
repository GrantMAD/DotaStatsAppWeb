import { cn } from "@/utils/cn";
import { AnimationWrapper } from "./AnimationWrapper";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = false, ...props }: GlassCardProps) {
  // Omit HTML animation events to avoid conflict with motion animation events
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onAnimationStart, onAnimationIteration, onAnimationEnd, ...filteredProps } = props;

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

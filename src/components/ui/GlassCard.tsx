import { cn } from "@/utils/cn";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = false, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-card p-6",
        hoverable && "glass-card-hover",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
